import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      lineItems: true,
      payments: true,
      issuedBy: true,
    },
  })

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (body.action === "issue") {
    const existing = await prisma.invoice.findUnique({ where: { id }, select: { dueDate: true } })
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: "ISSUED",
        issuedDate: new Date(),
        dueDate: existing?.dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    return NextResponse.json(invoice)
  }

  if (body.action === "pay") {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        paymentDate: new Date(),
        paymentMethod: body.paymentMethod || "BANK_TRANSFER",
        reference: body.reference || null,
      },
    })

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: "PAID" },
      include: { customer: true, lineItems: true, payments: true },
    })
    return NextResponse.json(updated)
  }

  if (body.action === "cancel") {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" },
    })
    return NextResponse.json(invoice)
  }

  if (body.action === "overdue") {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: "OVERDUE" },
    })
    return NextResponse.json(invoice)
  }

  // Generic update
  const invoice = await prisma.invoice.update({
    where: { id },
    data: body,
    include: { customer: true, lineItems: true, payments: true },
  })
  return NextResponse.json(invoice)
}
