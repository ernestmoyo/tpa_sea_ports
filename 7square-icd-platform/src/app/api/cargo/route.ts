import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const cargos = await prisma.cargo.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      containers: { include: { container: { select: { containerNumber: true } } } },
      dangerousGoods: { select: { imdgClass: true, unNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json(cargos)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.description || !body.weightKg || !body.cargoType) {
      return NextResponse.json({ message: "Description, weight, and cargo type are required" }, { status: 400 })
    }

    // Auto-calculate harbour tonnes: max(weightKg/1000, volumeCbm)
    const weightTonnes = (body.weightKg ?? 0) / 1000
    const volumeCbm = body.volumeCbm ?? 0
    const harbourTonnes = Math.max(weightTonnes, volumeCbm)

    const cargo = await prisma.cargo.create({
      data: {
        description: body.description,
        hsCode: body.hsCode,
        weightKg: body.weightKg,
        volumeCbm: body.volumeCbm,
        harbourTonnes,
        cifValueUsd: body.cifValueUsd,
        cargoType: body.cargoType,
        isDangerous: body.isDangerous ?? false,
        isColdStorage: body.isColdStorage ?? false,
        isValuable: body.isValuable ?? false,
        packageCount: body.packageCount,
        destinationCountry: body.destinationCountry,
        customerId: body.customerId,
      },
    })

    return NextResponse.json(cargo, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ message: error.message || "Failed to create cargo" }, { status: 500 })
  }
}
