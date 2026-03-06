import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.containerType = type
  if (search) where.containerNumber = { contains: search, mode: "insensitive" }

  const containers = await prisma.container.findMany({
    where: where as never,
    include: {
      customer: { select: { id: true, name: true } },
      vesselCall: { include: { vessel: { select: { name: true } } } },
      dangerousGoods: { select: { imdgClass: true, unNumber: true } },
      storageBookings: { where: { status: "ACTIVE" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(containers)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.containerNumber || !body.size) {
      return NextResponse.json({ message: "Container number and size are required" }, { status: 400 })
    }

    const container = await prisma.container.create({
      data: {
        containerNumber: body.containerNumber,
        size: body.size,
        containerType: body.containerType ?? "DRY",
        isFcl: body.isFcl ?? true,
        isEmpty: body.isEmpty ?? false,
        isOverDimension: body.isOverDimension ?? false,
        tareWeight: body.tareWeight,
        vgmWeight: body.vgmWeight,
        vgmCertified: body.vgmCertified ?? false,
        sealNumber: body.sealNumber,
        customerId: body.customerId,
        vesselCallId: body.vesselCallId,
      },
    })

    return NextResponse.json(container, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Container number already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: error.message || "Failed to create container" }, { status: 500 })
  }
}
