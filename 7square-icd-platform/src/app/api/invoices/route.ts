import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const customerId = searchParams.get("customerId")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const invoices = await prisma.invoice.findMany({
    where: where as never,
    include: {
      customer: { select: { id: true, name: true } },
      lineItems: true,
      _count: { select: { payments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(invoices)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.customerId) {
      return NextResponse.json({ message: "Customer is required" }, { status: 400 })
    }

    const lineItems = body.lineItems ?? []
    if (lineItems.length === 0) {
      return NextResponse.json({ message: "At least one line item is required" }, { status: 400 })
    }

    // Generate invoice number: INV-YYYYMMDD-XXXX
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    })
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, "0")}`

    // Calculate totals from line items
    const subtotal = lineItems.reduce((sum: number, item: { lineTotal: number }) => sum + item.lineTotal, 0)
    const vatRate = body.vatRate ?? 0
    const vatAmount = subtotal * (vatRate / 100)
    const totalAmount = subtotal + vatAmount

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: body.customerId,
        vesselCallId: body.vesselCallId,
        issuedById: body.issuedById,
        currency: body.currency ?? "USD",
        exchangeRate: body.exchangeRate,
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        status: "DRAFT",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes,
        lineItems: {
          create: lineItems.map((item: {
            tariffRateId?: string
            description: string
            clauseReference?: string
            quantity: number
            unitRate: number
            surchargeType?: string
            surchargeAmount?: number
            lineTotal: number
          }) => ({
            tariffRateId: item.tariffRateId,
            description: item.description,
            clauseReference: item.clauseReference,
            quantity: item.quantity,
            unitRate: item.unitRate,
            surchargeType: item.surchargeType,
            surchargeAmount: item.surchargeAmount ?? 0,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { lineItems: true, customer: true },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ message: error.message || "Failed to create invoice" }, { status: 500 })
  }
}
