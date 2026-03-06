import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "connect") {
      if (!body.containerId) {
        return NextResponse.json({ message: "Container ID is required" }, { status: 400 })
      }

      const container = await prisma.container.findUnique({
        where: { id: body.containerId },
        select: { containerType: true, size: true },
      })

      if (!container || container.containerType !== "REEFER") {
        return NextResponse.json({ message: "Container is not a reefer type" }, { status: 400 })
      }

      const existing = await prisma.reeferPowerLog.findFirst({
        where: { containerId: body.containerId, disconnectDate: null },
      })

      if (existing) {
        return NextResponse.json({ message: "Container is already connected to power" }, { status: 409 })
      }

      const dailyRate = container.size === "SIZE_20" ? 8.0 : 12.0

      const powerLog = await prisma.reeferPowerLog.create({
        data: {
          containerId: body.containerId,
          connectDate: new Date(),
          dailyRate,
        },
      })

      return NextResponse.json(powerLog, { status: 201 })
    }

    if (action === "disconnect") {
      if (!body.containerId) {
        return NextResponse.json({ message: "Container ID is required" }, { status: 400 })
      }

      const powerLog = await prisma.reeferPowerLog.findFirst({
        where: { containerId: body.containerId, disconnectDate: null },
      })

      if (!powerLog) {
        return NextResponse.json({ message: "No active power connection found" }, { status: 404 })
      }

      const updated = await prisma.reeferPowerLog.update({
        where: { id: powerLog.id },
        data: { disconnectDate: new Date() },
      })

      return NextResponse.json(updated)
    }

    if (action === "log_temperature") {
      if (!body.containerId || body.setTemperature === undefined || body.actualTemperature === undefined) {
        return NextResponse.json({ message: "Container ID, set temperature, and actual temperature are required" }, { status: 400 })
      }

      const deviation = Math.abs(body.actualTemperature - body.setTemperature)
      const alertGenerated = deviation > 3

      const log = await prisma.reeferMonitoring.create({
        data: {
          containerId: body.containerId,
          setTemperature: body.setTemperature,
          actualTemperature: body.actualTemperature,
          humidity: body.humidity ?? null,
          powerStatus: body.powerStatus ?? "ON",
          alertGenerated,
          alertMessage: alertGenerated
            ? `Temperature deviation: ${deviation.toFixed(1)}C (set: ${body.setTemperature}C, actual: ${body.actualTemperature}C)`
            : null,
        },
      })

      return NextResponse.json(log, { status: 201 })
    }

    return NextResponse.json({ message: "Invalid action. Use 'connect', 'disconnect', or 'log_temperature'." }, { status: 400 })
  } catch (err: unknown) {
    const error = err as { message?: string }
    return NextResponse.json({ message: error.message || "Reefer operation failed" }, { status: 500 })
  }
}
