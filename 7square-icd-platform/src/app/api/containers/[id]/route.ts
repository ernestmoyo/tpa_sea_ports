import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const container = await prisma.container.findUnique({
    where: { id },
    include: {
      customer: true,
      vesselCall: { include: { vessel: true } },
      cargos: { include: { cargo: true } },
      dangerousGoods: true,
      storageBookings: { include: { slot: { include: { warehouse: true } } } },
      reeferLogs: { orderBy: { timestamp: "desc" }, take: 10 },
      reeferPowerLogs: true,
      operations: { orderBy: { startedAt: "desc" } },
      documents: true,
    },
  })

  if (!container) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(container)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const container = await prisma.container.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(container)
}
