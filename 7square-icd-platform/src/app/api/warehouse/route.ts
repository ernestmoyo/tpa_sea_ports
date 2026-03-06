import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      slots: {
        select: { id: true, slotCode: true, isOccupied: true, slotType: true },
      },
    },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(warehouses)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.warehouseType || !body.totalCapacityTeu) {
      return NextResponse.json({ message: "Name, type, and capacity are required" }, { status: 400 })
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: body.name,
        warehouseType: body.warehouseType,
        location: body.location,
        totalCapacityTeu: body.totalCapacityTeu,
      },
    })

    return NextResponse.json(warehouse, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ message: error.message || "Failed to create warehouse" }, { status: 500 })
  }
}
