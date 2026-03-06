import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dangerousGoods = await prisma.dangerousGoods.findUnique({
    where: { id },
    include: {
      container: true,
      cargo: true,
    },
  })

  if (!dangerousGoods) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(dangerousGoods)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const dangerousGoods = await prisma.dangerousGoods.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(dangerousGoods)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await prisma.dangerousGoods.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
