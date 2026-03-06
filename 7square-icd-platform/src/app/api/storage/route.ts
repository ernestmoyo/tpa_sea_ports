import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getFreePeriodDays } from "@/lib/storage-calculator"

export async function GET() {
  const bookings = await prisma.storageBooking.findMany({
    where: { status: "ACTIVE" },
    include: {
      container: { select: { containerNumber: true, size: true, containerType: true } },
      slot: { include: { warehouse: { select: { name: true } } } },
    },
    orderBy: { checkInDate: "desc" },
    take: 100,
  })
  return NextResponse.json(bookings)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.containerId || !body.slotId || !body.checkInDate || !body.trafficType) {
      return NextResponse.json({ message: "Container, slot, check-in date, and traffic type are required" }, { status: 400 })
    }

    // Auto-calculate free period
    const freePeriodDays = getFreePeriodDays({
      trafficType: body.trafficType,
      cargoForm: body.cargoForm ?? "FCL",
      containerSize: body.containerSize,
      isDangerous: body.isDangerous,
      isReefer: body.isReefer,
      isICDPortExtension: body.isICDPortExtension,
      checkInDate: new Date(body.checkInDate),
    })

    const booking = await prisma.storageBooking.create({
      data: {
        containerId: body.containerId,
        slotId: body.slotId,
        checkInDate: new Date(body.checkInDate),
        trafficType: body.trafficType,
        freePeriodDays,
        notes: body.notes,
      },
    })

    // Mark slot as occupied and update warehouse occupancy
    const slot = await prisma.storageSlot.update({
      where: { id: body.slotId },
      data: { isOccupied: true },
      include: { warehouse: true },
    })

    await prisma.warehouse.update({
      where: { id: slot.warehouseId },
      data: { currentOccupancy: { increment: 1 } },
    })

    // Update container status
    await prisma.container.update({
      where: { id: body.containerId },
      data: { status: "IN_STORAGE" },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ message: error.message || "Failed to create storage booking" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.bookingId) {
      return NextResponse.json({ message: "Booking ID is required" }, { status: 400 })
    }

    if (body.action === "checkout") {
      const booking = await prisma.storageBooking.findUnique({
        where: { id: body.bookingId },
        include: { slot: true },
      })

      if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

      const updated = await prisma.storageBooking.update({
        where: { id: body.bookingId },
        data: {
          checkOutDate: new Date(),
          status: "COMPLETED",
        },
      })

      // Free the slot and decrement warehouse occupancy
      await prisma.storageSlot.update({
        where: { id: booking.slotId },
        data: { isOccupied: false },
      })

      await prisma.warehouse.update({
        where: { id: booking.slot.warehouseId },
        data: { currentOccupancy: { decrement: 1 } },
      })

      // Update container status
      await prisma.container.update({
        where: { id: booking.containerId },
        data: { status: "READY_FOR_RELEASE" },
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 })
  } catch (err: unknown) {
    const error = err as { message?: string }
    return NextResponse.json({ message: error.message || "Storage operation failed" }, { status: 500 })
  }
}
