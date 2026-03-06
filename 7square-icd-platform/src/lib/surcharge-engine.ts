import { prisma } from "./prisma"

export type SurchargeCategory = "DG_HANDLING" | "DG_STORAGE" | "OVER_DIMENSION" | "COLD_STORAGE" | "OVERTIME"

export interface SurchargeResult {
  surchargeType: SurchargeCategory
  percentage: number
  surchargeAmount: number
  description: string
}

export interface ChargeWithSurcharges {
  baseCharge: number
  surcharges: SurchargeResult[]
  totalSurchargeAmount: number
  finalCharge: number
  clauseReference: string
}

// Surcharge percentages per TPA Tariff Book
const SURCHARGE_RATES: Record<SurchargeCategory, number> = {
  DG_HANDLING: 10,    // +10% on stevedoring & shorehandling (Clauses 14, 29, 36, 37, 38)
  DG_STORAGE: 20,     // +20% on storage (Clause 32, after 24hr free)
  OVER_DIMENSION: 30, // +30% on handling (Clauses 29, 36, 37, 38)
  COLD_STORAGE: 30,   // +30% on handling (Clause 29)
  OVERTIME: 100,       // Double rates (varies by clause)
}

// Which clauses each surcharge applies to
const SURCHARGE_CLAUSES: Record<SurchargeCategory, number[]> = {
  DG_HANDLING: [14, 29, 36, 37, 38],
  DG_STORAGE: [32],
  OVER_DIMENSION: [29, 36, 37, 38],
  COLD_STORAGE: [29],
  OVERTIME: [1, 5, 7, 11, 12, 14],
}

/**
 * Check if a surcharge applies to a given clause number.
 */
export function isSurchargeApplicable(surchargeType: SurchargeCategory, clauseNumber: number): boolean {
  return SURCHARGE_CLAUSES[surchargeType]?.includes(clauseNumber) ?? false
}

/**
 * Calculate a single surcharge on a base charge.
 */
export function calculateSurcharge(
  baseCharge: number,
  surchargeType: SurchargeCategory,
  customPercentage?: number
): SurchargeResult {
  const percentage = customPercentage ?? SURCHARGE_RATES[surchargeType]
  const surchargeAmount = baseCharge * (percentage / 100)

  const descriptions: Record<SurchargeCategory, string> = {
    DG_HANDLING: `Dangerous Goods handling surcharge (+${percentage}%)`,
    DG_STORAGE: `Dangerous Goods storage surcharge (+${percentage}%)`,
    OVER_DIMENSION: `Over-dimension container surcharge (+${percentage}%)`,
    COLD_STORAGE: `Cold storage cargo surcharge (+${percentage}%)`,
    OVERTIME: `Overtime surcharge (+${percentage}%)`,
  }

  return {
    surchargeType,
    percentage,
    surchargeAmount: Math.round(surchargeAmount * 100) / 100,
    description: descriptions[surchargeType],
  }
}

/**
 * Apply all applicable surcharges to a base charge.
 *
 * Determines which surcharges apply based on:
 * - Clause number (which surcharges are valid for this clause)
 * - Cargo properties (isDangerous, isOverDimension, isColdStorage)
 * - Time of operation (isOvertime)
 *
 * Surcharges are additive, not compounding.
 * Example: A DG over-dimension container at Clause 36 gets +10% DG + 30% OD = +40% total
 */
export function applySurcharges(
  baseCharge: number,
  clauseNumber: number,
  options: {
    isDangerous?: boolean
    isOverDimension?: boolean
    isColdStorage?: boolean
    isOvertime?: boolean
  },
  clauseReference = ""
): ChargeWithSurcharges {
  const surcharges: SurchargeResult[] = []

  // DG handling surcharge (+10%)
  if (options.isDangerous && isSurchargeApplicable("DG_HANDLING", clauseNumber)) {
    surcharges.push(calculateSurcharge(baseCharge, "DG_HANDLING"))
  }

  // DG storage surcharge (+20%)
  if (options.isDangerous && isSurchargeApplicable("DG_STORAGE", clauseNumber)) {
    surcharges.push(calculateSurcharge(baseCharge, "DG_STORAGE"))
  }

  // Over-dimension surcharge (+30%)
  if (options.isOverDimension && isSurchargeApplicable("OVER_DIMENSION", clauseNumber)) {
    surcharges.push(calculateSurcharge(baseCharge, "OVER_DIMENSION"))
  }

  // Cold storage surcharge (+30%)
  if (options.isColdStorage && isSurchargeApplicable("COLD_STORAGE", clauseNumber)) {
    surcharges.push(calculateSurcharge(baseCharge, "COLD_STORAGE"))
  }

  // Overtime surcharge (double rates for certain clauses)
  if (options.isOvertime && isSurchargeApplicable("OVERTIME", clauseNumber)) {
    surcharges.push(calculateSurcharge(baseCharge, "OVERTIME"))
  }

  const totalSurchargeAmount = surcharges.reduce((sum, s) => sum + s.surchargeAmount, 0)
  const finalCharge = baseCharge + totalSurchargeAmount

  // Build clause reference with surcharge annotations
  let ref = clauseReference || `Clause ${clauseNumber}`
  if (surcharges.length > 0) {
    const surchargeLabels = surcharges.map((s) => {
      switch (s.surchargeType) {
        case "DG_HANDLING": return "+10% DG"
        case "DG_STORAGE": return "+20% DG"
        case "OVER_DIMENSION": return "+30% OD"
        case "COLD_STORAGE": return "+30% Cold"
        case "OVERTIME": return "OT"
      }
    })
    ref += ` (${surchargeLabels.join(", ")})`
  }

  return {
    baseCharge,
    surcharges,
    totalSurchargeAmount: Math.round(totalSurchargeAmount * 100) / 100,
    finalCharge: Math.round(finalCharge * 100) / 100,
    clauseReference: ref,
  }
}

/**
 * Determine working hours shift and overtime status.
 *
 * TPA Working Hours:
 * - 1st shift: 0700-1500 (regular)
 * - 2nd shift: 1500-2300 (regular)
 * - 3rd shift: 2300-0700 (overtime)
 * - Weekends & public holidays: all overtime
 */
export function isOvertimeHours(timestamp: Date): boolean {
  const day = timestamp.getDay() // 0=Sunday, 6=Saturday
  if (day === 0 || day === 6) return true

  const hours = timestamp.getHours()
  // 3rd shift: 2300-0700 is overtime
  return hours >= 23 || hours < 7
}

/**
 * Get the current shift name.
 */
export function getCurrentShift(timestamp: Date): string {
  const day = timestamp.getDay()
  if (day === 0 || day === 6) return "Weekend/Holiday (Overtime)"

  const hours = timestamp.getHours()
  if (hours >= 7 && hours < 15) return "1st Shift (0700-1500)"
  if (hours >= 15 && hours < 23) return "2nd Shift (1500-2300)"
  return "3rd Shift (2300-0700) - Overtime"
}

/**
 * Load surcharge rules from database (for display/admin purposes).
 */
export async function getSurchargeRules() {
  return prisma.tariffSurcharge.findMany({
    where: { isActive: true },
    orderBy: { surchargeType: "asc" },
  })
}

/**
 * Calculate VAT on a charge amount.
 * VAT rate is configurable (currently 18% in Tanzania).
 */
export function calculateVAT(amount: number, vatRate = 18): { vatAmount: number; totalWithVAT: number } {
  const vatAmount = Math.round(amount * (vatRate / 100) * 100) / 100
  return {
    vatAmount,
    totalWithVAT: Math.round((amount + vatAmount) * 100) / 100,
  }
}
