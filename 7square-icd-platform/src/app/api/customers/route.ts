import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { containers: true, invoices: true } },
    },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(customers)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.customerType) {
      return NextResponse.json({ message: "Name and customer type are required" }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        customerType: body.customerType,
        companyName: body.companyName,
        country: body.country ?? "TZ",
        address: body.address,
        phone: body.phone,
        email: body.email,
        taxId: body.taxId,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ message: error.message || "Failed to create customer" }, { status: 500 })
  }
}
