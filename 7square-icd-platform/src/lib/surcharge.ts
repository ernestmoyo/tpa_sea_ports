/**
 * Auto-surcharge utility for TPA Tariff Book compliance.
 *
 * Surcharge rules:
 * - Dangerous Goods handling: +10% (Clauses 14, 29, 36, 37, 38)
 * - Dangerous Goods storage: +20% (Clause 32, after 24hr free)
 * - Over-dimension containers: +30% (Clauses 29, 36, 37, 38)
 * - Cold storage cargo handling: +30% (Clause 29)
 */

export interface SurchargeFlags {
  isDangerous?: boolean
  isOverDimension?: boolean
  isColdStorage?: boolean
}

export interface SurchargeResult {
  surchargeType: string
  surchargePercent: number
  surchargeAmount: number
  description: string
}

/**
 * Calculate handling surcharges for a given base amount.
 * Applies to stevedoring and shorehandling charges.
 */
export function calculateHandlingSurcharges(
  baseAmount: number,
  flags: SurchargeFlags
): SurchargeResult[] {
  const surcharges: SurchargeResult[] = []

  if (flags.isDangerous) {
    surcharges.push({
      surchargeType: "DG_HANDLING",
      surchargePercent: 10,
      surchargeAmount: baseAmount * 0.10,
      description: "Dangerous Goods handling surcharge (+10%)",
    })
  }

  if (flags.isOverDimension) {
    surcharges.push({
      surchargeType: "OVER_DIMENSION",
      surchargePercent: 30,
      surchargeAmount: baseAmount * 0.30,
      description: "Over-dimension container surcharge (+30%)",
    })
  }

  if (flags.isColdStorage) {
    surcharges.push({
      surchargeType: "COLD_STORAGE",
      surchargePercent: 30,
      surchargeAmount: baseAmount * 0.30,
      description: "Cold storage cargo handling surcharge (+30%)",
    })
  }

  return surcharges
}

/**
 * Calculate storage surcharges (DG only — +20%).
 */
export function calculateStorageSurcharge(
  baseAmount: number,
  flags: SurchargeFlags
): SurchargeResult | null {
  if (!flags.isDangerous) return null

  return {
    surchargeType: "DG_STORAGE",
    surchargePercent: 20,
    surchargeAmount: baseAmount * 0.20,
    description: "Dangerous Goods storage surcharge (+20%)",
  }
}

/**
 * Calculate total surcharge amount for a base charge given flags.
 * Returns combined surcharge percentage and amount.
 */
export function getTotalSurcharge(
  baseAmount: number,
  flags: SurchargeFlags,
  isStorageCharge = false
): { totalPercent: number; totalAmount: number; surcharges: SurchargeResult[] } {
  const surcharges = isStorageCharge
    ? [calculateStorageSurcharge(baseAmount, flags)].filter(Boolean) as SurchargeResult[]
    : calculateHandlingSurcharges(baseAmount, flags)

  const totalAmount = surcharges.reduce((sum, s) => sum + s.surchargeAmount, 0)
  const totalPercent = surcharges.reduce((sum, s) => sum + s.surchargePercent, 0)

  return { totalPercent, totalAmount, surcharges }
}
