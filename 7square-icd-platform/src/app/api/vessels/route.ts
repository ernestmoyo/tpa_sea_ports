import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get("activeCalls")) {
    const calls = await prisma.vesselCall.findMany({
      where: { status: { in: ["EXPECTED", "ARRIVED", "BERTHED", "WORKING"] } },
      include: { vessel: { select: { name: true } } },
      orderBy: { eta: "asc" },
    })
    return NextResponse.json(calls)
  }

  const vessels = await prisma.vessel.findMany({
    include: {
      _count: { select: { vesselCalls: true } },
    },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(vessels)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.grt || !body.vesselType) {
      return NextResponse.json({ message: "Vessel name, GRT, and type are required" }, { status: 400 })
    }

    const vessel = await prisma.vessel.create({
      data: {
        name: body.name,
        imoNumber: body.imoNumber,
        grt: body.grt,
        dwt: body.dwt,
        loa: body.loa,
        vesselType: body.vesselType,
        flagState: body.flagState,
        isCoaster: body.isCoaster ?? false,
      },
    })

    return NextResponse.json(vessel, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    if (error.code === "P2002") {
      return NextResponse.json({ message: "IMO number already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: error.message || "Failed to create vessel" }, { status: 500 })
  }
}
