import { prisma } from "./prisma"

export interface TariffLookupParams {
  clauseNumber: number
  serviceCode?: string
  vesselCategory?: "DEEP_SEA" | "COASTER" | "TRADITIONAL" | "ALL"
  cargoClass?: "DOMESTIC_IMPORT" | "DOMESTIC_EXPORT" | "TRANSIT_IMPORT" | "TRANSIT_EXPORT" | "TRANSSHIPMENT" | "COASTWISE" | "ALL"
  containerSize?: "20" | "40" | "45"
  containerLoadType?: "FCL" | "LCL" | "EMPTY" | "ALL"
  isOvertime?: boolean
}

export interface TariffResult {
  rateId: string
  serviceCode: string
  serviceName: string
  clauseNumber: number
  clauseTitle: string
  rateAmount: number
  rateUnit: string
  minimumAmount: number | null
  overtimeRate: number | null
  notes: string | null
}

export interface ChargeCalculation {
  tariff: TariffResult
  quantity: number
  baseCharge: number
  minimumApplied: boolean
  finalCharge: number
  clauseReference: string
}

/**
 * Look up a tariff rate from the TPA Tariff Book.
 * Tries exact match first, then falls back to broader matches (e.g. vesselCategory=ALL).
 */
export async function lookupTariffRate(params: TariffLookupParams): Promise<TariffResult | null> {
  const clause = await prisma.tariffClause.findUnique({
    where: { clauseNumber: params.clauseNumber },
  })
  if (!clause) return null

  // Build filter conditions — try specific first, then fall back to ALL
  const where: Record<string, unknown> = {
    clauseId: clause.id,
    isActive: true,
  }

  if (params.serviceCode) where.serviceCode = params.serviceCode
  if (params.isOvertime !== undefined) where.isOvertime = params.isOvertime

  // Try specific match first
  if (params.containerSize) where.containerSize = params.containerSize
  if (params.containerLoadType) where.containerLoadType = params.containerLoadType

  // Vessel category: try specific then ALL
  const vesselCategories = params.vesselCategory && params.vesselCategory !== "ALL"
    ? [params.vesselCategory, "ALL"]
    : ["ALL"]

  // Cargo class: try specific then ALL
  const cargoClasses = params.cargoClass && params.cargoClass !== "ALL"
    ? [params.cargoClass, "ALL"]
    : ["ALL"]

  for (const vc of vesselCategories) {
    for (const cc of cargoClasses) {
      const rate = await prisma.tariffRate.findFirst({
        where: { ...where, vesselCategory: vc as never, cargoClass: cc as never },
        include: { clause: true },
      })

      if (rate) {
        return {
          rateId: rate.id,
          serviceCode: rate.serviceCode,
          serviceName: rate.serviceName,
          clauseNumber: clause.clauseNumber,
          clauseTitle: clause.title,
          rateAmount: Number(rate.rateAmount),
          rateUnit: rate.rateUnit,
          minimumAmount: rate.minimumAmount ? Number(rate.minimumAmount) : null,
          overtimeRate: rate.overtimeRate ? Number(rate.overtimeRate) : null,
          notes: rate.notes,
        }
      }
    }
  }

  // Fallback: try without container size/load type constraints
  if (params.containerSize || params.containerLoadType) {
    const fallbackWhere: Record<string, unknown> = {
      clauseId: clause.id,
      isActive: true,
    }
    if (params.serviceCode) fallbackWhere.serviceCode = params.serviceCode

    const rate = await prisma.tariffRate.findFirst({
      where: fallbackWhere as never,
      include: { clause: true },
    })
    if (rate) {
      return {
        rateId: rate.id,
        serviceCode: rate.serviceCode,
        serviceName: rate.serviceName,
        clauseNumber: clause.clauseNumber,
        clauseTitle: clause.title,
        rateAmount: Number(rate.rateAmount),
        rateUnit: rate.rateUnit,
        minimumAmount: rate.minimumAmount ? Number(rate.minimumAmount) : null,
        overtimeRate: rate.overtimeRate ? Number(rate.overtimeRate) : null,
        notes: rate.notes,
      }
    }
  }

  return null
}

/**
 * Look up multiple tariff rates matching a service code pattern.
 */
export async function lookupTariffRatesByClause(clauseNumber: number): Promise<TariffResult[]> {
  const clause = await prisma.tariffClause.findUnique({
    where: { clauseNumber },
  })
  if (!clause) return []

  const rates = await prisma.tariffRate.findMany({
    where: { clauseId: clause.id, isActive: true },
    include: { clause: true },
    orderBy: { serviceCode: "asc" },
  })

  return rates.map((rate) => ({
    rateId: rate.id,
    serviceCode: rate.serviceCode,
    serviceName: rate.serviceName,
    clauseNumber: clause.clauseNumber,
    clauseTitle: clause.title,
    rateAmount: Number(rate.rateAmount),
    rateUnit: rate.rateUnit,
    minimumAmount: rate.minimumAmount ? Number(rate.minimumAmount) : null,
    overtimeRate: rate.overtimeRate ? Number(rate.overtimeRate) : null,
    notes: rate.notes,
  }))
}

/**
 * Calculate a charge given a tariff rate and quantity.
 * Applies minimum charge rules where applicable.
 */
export function calculateCharge(tariff: TariffResult, quantity: number, isOvertime = false): ChargeCalculation {
  const effectiveRate = isOvertime && tariff.overtimeRate ? tariff.overtimeRate : tariff.rateAmount
  let baseCharge = effectiveRate * quantity
  let minimumApplied = false

  if (tariff.minimumAmount && baseCharge < tariff.minimumAmount) {
    baseCharge = tariff.minimumAmount
    minimumApplied = true
  }

  return {
    tariff,
    quantity,
    baseCharge,
    minimumApplied,
    finalCharge: baseCharge,
    clauseReference: `Clause ${tariff.clauseNumber}`,
  }
}

/**
 * Calculate pilotage fees (Clause 1).
 * Rate is per 100 GRT per operation.
 */
export async function calculatePilotage(
  grt: number,
  serviceCode: string,
  vesselCategory: "DEEP_SEA" | "COASTER"
): Promise<ChargeCalculation | null> {
  const tariff = await lookupTariffRate({
    clauseNumber: 1,
    serviceCode,
    vesselCategory,
  })
  if (!tariff) return null

  const units = grt / 100
  return calculateCharge(tariff, units)
}

/**
 * Calculate port dues (Clause 2).
 * Rate is per 100 GRT per call, tiered by 5-day periods.
 */
export async function calculatePortDues(
  grt: number,
  daysInPort: number,
  vesselCategory: "DEEP_SEA" | "COASTER",
  isBunkering = false
): Promise<ChargeCalculation[]> {
  const charges: ChargeCalculation[] = []
  const units = grt / 100

  // First 5 days
  const firstPeriodDays = Math.min(daysInPort, 5)
  if (firstPeriodDays > 0) {
    const tariff = await lookupTariffRate({
      clauseNumber: 2,
      serviceCode: "PORT_DUES_FIRST5",
      vesselCategory,
    })
    if (tariff) {
      const charge = calculateCharge(tariff, units)
      if (isBunkering) charge.finalCharge *= 0.5
      charges.push(charge)
    }
  }

  // Successive 5-day periods
  if (daysInPort > 5) {
    const remainingPeriods = Math.ceil((daysInPort - 5) / 5)
    const tariff = await lookupTariffRate({
      clauseNumber: 2,
      serviceCode: "PORT_DUES_SUCC5",
      vesselCategory,
    })
    if (tariff) {
      const charge = calculateCharge(tariff, units * remainingPeriods)
      if (isBunkering) charge.finalCharge *= 0.5
      charges.push(charge)
    }
  }

  return charges
}

/**
 * Calculate container stevedoring charges (Clauses 36, 37, 38).
 * Different rates for DCT berths 8-11, berths 0-7, and RORO.
 */
export async function calculateContainerStevedoring(
  clauseNumber: 36 | 37 | 38,
  containerSize: "20" | "40",
  loadType: "FCL" | "LCL" | "EMPTY",
  isDangerous = false,
  isOverDimension = false
): Promise<ChargeCalculation | null> {
  const servicePrefix = clauseNumber === 36 ? "DCT_STEV" : clauseNumber === 37 ? "B07_STEV" : "RORO_STEV"
  const serviceCode = `${servicePrefix}_${loadType}`

  const tariff = await lookupTariffRate({
    clauseNumber,
    serviceCode,
    containerSize,
    containerLoadType: loadType,
  })
  if (!tariff) return null

  const charge = calculateCharge(tariff, 1)

  // Apply surcharges
  if (isDangerous) {
    charge.finalCharge *= 1.10 // +10% DG surcharge
    charge.clauseReference += " (+10% DG)"
  }
  if (isOverDimension) {
    charge.finalCharge *= 1.30 // +30% over-dimension
    charge.clauseReference += " (+30% OD)"
  }

  return charge
}

/**
 * Calculate wharfage (Clause 27).
 * Domestic: ad valorem (1.6% import, 1.0% export)
 * Transit: per HTN or per container
 */
export async function calculateWharfage(
  cargoClass: "DOMESTIC_IMPORT" | "DOMESTIC_EXPORT" | "TRANSIT_IMPORT" | "TRANSIT_EXPORT" | "TRANSSHIPMENT",
  options: {
    cifValueUsd?: number
    harbourTonnes?: number
    containerSize?: "20" | "40"
    loadType?: "FCL" | "LCL" | "EMPTY"
  }
): Promise<ChargeCalculation | null> {
  // Containerized transit — flat rate per container
  if ((cargoClass === "TRANSIT_IMPORT" || cargoClass === "TRANSIT_EXPORT") && options.containerSize && options.loadType === "FCL") {
    const serviceCode = cargoClass === "TRANSIT_IMPORT" ? "WHARF_TRANSIT_FCL_IMP" : "WHARF_TRANSIT_FCL_EXP"
    const tariff = await lookupTariffRate({
      clauseNumber: 27,
      serviceCode,
      containerSize: options.containerSize,
      cargoClass,
    })
    if (tariff) return calculateCharge(tariff, 1)
  }

  // Ad valorem for domestic
  if ((cargoClass === "DOMESTIC_IMPORT" || cargoClass === "DOMESTIC_EXPORT") && options.cifValueUsd) {
    const serviceCode = cargoClass === "DOMESTIC_IMPORT" ? "WHARF_DOM_IMP" : "WHARF_DOM_EXP"
    const tariff = await lookupTariffRate({
      clauseNumber: 27,
      serviceCode,
      cargoClass,
    })
    if (tariff) {
      const charge = calculateCharge(tariff, options.cifValueUsd)
      // rateAmount is the percentage (e.g. 1.6), so charge = cifValue * rate / 100
      charge.baseCharge = options.cifValueUsd * tariff.rateAmount / 100
      charge.finalCharge = charge.baseCharge
      return charge
    }
  }

  // Per HTN for transit break bulk
  if (options.harbourTonnes) {
    const tariff = await lookupTariffRate({
      clauseNumber: 27,
      serviceCode: "WHARF_TRANSIT_HTN",
      cargoClass,
    })
    if (tariff) return calculateCharge(tariff, options.harbourTonnes)
  }

  return null
}

/**
 * Calculate ICD special rates (Clause 42).
 * Package rates for NASACO, Ubungo, and other ICDs.
 */
export async function calculateICDRate(
  icdLocation: "NASACO" | "UBUNGO" | "OTHER",
  containerSize: "20" | "40"
): Promise<ChargeCalculation | null> {
  const serviceCode = `ICD_${icdLocation}_PKG`

  const tariff = await lookupTariffRate({
    clauseNumber: 42,
    serviceCode,
    containerSize,
  })
  if (!tariff) return null

  return calculateCharge(tariff, 1)
}

/**
 * Get all tariff clauses with their rate counts.
 */
export async function getAllClauses() {
  return prisma.tariffClause.findMany({
    where: { isActive: true },
    include: { _count: { select: { rates: true } } },
    orderBy: { clauseNumber: "asc" },
  })
}

/**
 * Get all active surcharges.
 */
export async function getAllSurcharges() {
  return prisma.tariffSurcharge.findMany({
    where: { isActive: true },
  })
}
