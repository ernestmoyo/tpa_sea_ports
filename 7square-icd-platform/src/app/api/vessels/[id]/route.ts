import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vessel = await prisma.vessel.findUnique({
    where: { id },
    include: {
      vesselCalls: {
        include: {
          containers: true,
        },
      },
    },
  })

  if (!vessel) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(vessel)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const vessel = await prisma.vessel.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(vessel)
}
