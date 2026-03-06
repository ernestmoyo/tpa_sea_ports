import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const dangerousGoods = await prisma.dangerousGoods.findMany({
    include: {
      container: { select: { id: true, containerNumber: true } },
      cargo: { select: { id: true, description: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json(dangerousGoods)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.imdgClass || !body.unNumber || !body.properShippingName) {
      return NextResponse.json({ message: "IMDG class, UN number, and proper shipping name are required" }, { status: 400 })
    }

    const dg = await prisma.dangerousGoods.create({
      data: {
        containerId: body.containerId || null,
        cargoId: body.cargoId || null,
        imdgClass: body.imdgClass,
        unNumber: body.unNumber,
        properShippingName: body.properShippingName,
        packingGroup: body.packingGroup || null,
        flashPoint: body.flashPoint || null,
        segregationGroup: body.segregationGroup || null,
        emergencySchedule: body.emergencySchedule || null,
        msdsDocumentId: body.msdsDocumentId || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(dg, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ message: error.message || "Failed to register dangerous goods" }, { status: 500 })
  }
}
