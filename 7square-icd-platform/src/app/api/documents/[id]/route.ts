import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      container: true,
      cargo: true,
      customer: true,
    },
  })

  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(document)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  // Auto-stamp processedAt on first update if not already set
  const existing = await prisma.document.findUnique({ where: { id }, select: { processedAt: true } })
  const data = { ...body }
  if (existing && !existing.processedAt) {
    data.processedAt = new Date()
  }

  const document = await prisma.document.update({
    where: { id },
    data,
  })

  return NextResponse.json(document)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await prisma.document.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
