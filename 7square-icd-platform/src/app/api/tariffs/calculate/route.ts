import { NextRequest, NextResponse } from "next/server"
import { lookupTariffRate, calculateCharge } from "@/lib/tariff-engine"
import { calculateStorage, type StorageParams } from "@/lib/storage-calculator"
import { applySurcharges } from "@/lib/surcharge-engine"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type } = body

  if (type === "tariff") {
    const tariff = await lookupTariffRate({
      clauseNumber: body.clauseNumber,
      serviceCode: body.serviceCode,
      vesselCategory: body.vesselCategory,
      cargoClass: body.cargoClass,
      containerSize: body.containerSize,
      containerLoadType: body.containerLoadType,
    })

    if (!tariff) return NextResponse.json({ error: "No matching tariff rate found" }, { status: 404 })

    const charge = calculateCharge(tariff, body.quantity ?? 1, body.isOvertime)

    // Apply surcharges if applicable
    const withSurcharges = applySurcharges(
      charge.finalCharge,
      body.clauseNumber,
      {
        isDangerous: body.isDangerous,
        isOverDimension: body.isOverDimension,
        isColdStorage: body.isColdStorage,
        isOvertime: body.isOvertime,
      },
      charge.clauseReference
    )

    return NextResponse.json({
      tariff,
      charge,
      surcharges: withSurcharges,
    })
  }

  if (type === "storage") {
    const params: StorageParams = {
      trafficType: body.trafficType,
      cargoForm: body.cargoForm,
      containerSize: body.containerSize,
      isDangerous: body.isDangerous,
      isReefer: body.isReefer,
      isICDPortExtension: body.isICDPortExtension,
      icdType: body.icdType,
      checkInDate: new Date(body.checkInDate),
      checkOutDate: body.checkOutDate ? new Date(body.checkOutDate) : undefined,
    }

    const result = calculateStorage(params, body.quantity ?? 1)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: "Invalid calculation type. Use 'tariff' or 'storage'." }, { status: 400 })
}
