import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cargo = await prisma.cargo.findUnique({
    where: { id },
    include: {
      customer: true,
      containers: {
        include: {
          container: true,
        },
      },
      dangerousGoods: true,
      documents: true,
    },
  })

  if (!cargo) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(cargo)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const cargo = await prisma.cargo.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(cargo)
}
