import { prisma } from "./prisma"

export type TrafficType =
  | "DOMESTIC_IMPORT"
  | "DOMESTIC_EXPORT"
  | "TRANSIT_IMPORT"
  | "TRANSIT_EXPORT"
  | "TRANSSHIPMENT"
  | "COASTWISE"

export type CargoForm = "BREAKBULK" | "FCL" | "EMPTY"

export interface StorageParams {
  trafficType: TrafficType
  cargoForm: CargoForm
  containerSize?: "20" | "40"
  isDangerous?: boolean
  isReefer?: boolean
  isICDPortExtension?: boolean
  icdType?: "NASACO" | "UBUNGO" | "OTHER"
  checkInDate: Date
  checkOutDate?: Date // defaults to now
}

export interface StorageTier {
  label: string
  days: number
  dailyRate: number
  tierTotal: number
}

export interface StorageCalculation {
  totalDays: number
  freePeriodDays: number
  chargeableDays: number
  tiers: StorageTier[]
  baseStorageCharge: number
  dgSurchargeAmount: number
  totalCharge: number
  clauseReference: string
}

// Free period rules from TPA Tariff Book Clause 32
const FREE_PERIODS: Record<string, number> = {
  // Standard free periods
  "DOMESTIC_IMPORT_BREAKBULK": 5,
  "DOMESTIC_EXPORT_BREAKBULK": 5,
  "DOMESTIC_IMPORT_FCL": 5,
  "DOMESTIC_EXPORT_FCL": 5,
  "TRANSIT_IMPORT_BREAKBULK": 15,
  "TRANSIT_EXPORT_BREAKBULK": 21,
  "TRANSIT_IMPORT_FCL": 15,
  "TRANSIT_EXPORT_FCL": 21,
  "TRANSSHIPMENT_FCL": 15,     // Clause 39: transshipment containers get 15 days
  "TRANSSHIPMENT_BREAKBULK": 10, // Clause 32: transshipment break bulk gets 10 days
  "COASTWISE_BREAKBULK": 3,
  "EMPTY": 5,
  "EMPTY_RECEIVED_OUTSIDE": 3,
  // ICD Port Extension mode
  "ICD_LOCAL_IMPORT": 30,
  "ICD_TRANSIT_IMPORT": 60,
  "ICD_LOCAL_GENERAL": 30,
  "ICD_TRANSIT_GENERAL": 60,
}

// Storage rate tiers from Clause 32 (per day per unit for containers, per HTN/day for break bulk)
interface RateTier {
  days: number       // number of days this tier lasts (Infinity for "thereafter")
  rate20: number     // rate for 20ft or break bulk import
  rate40: number     // rate for 40ft or break bulk export (0 = same as rate20)
}

const STORAGE_TIERS: Record<string, RateTier[]> = {
  // Domestic FCL Import
  "DOMESTIC_IMPORT_FCL": [
    { days: 10, rate20: 20, rate40: 40 },
    { days: Infinity, rate20: 40, rate40: 80 },
  ],
  // Domestic FCL Export
  "DOMESTIC_EXPORT_FCL": [
    { days: Infinity, rate20: 16, rate40: 32 },
  ],
  // Transit FCL Import
  "TRANSIT_IMPORT_FCL": [
    { days: 6, rate20: 20, rate40: 40 },
    { days: Infinity, rate20: 40, rate40: 80 },
  ],
  // Transit FCL Export
  "TRANSIT_EXPORT_FCL": [
    { days: Infinity, rate20: 16, rate40: 32 },
  ],
  // Domestic Break Bulk Import (per HTN/day)
  "DOMESTIC_IMPORT_BREAKBULK": [
    { days: 30, rate20: 1.00, rate40: 1.00 },
    { days: Infinity, rate20: 1.50, rate40: 1.50 },
  ],
  // Domestic Break Bulk Export (per HTN/day)
  "DOMESTIC_EXPORT_BREAKBULK": [
    { days: Infinity, rate20: 0.50, rate40: 0.50 },
  ],
  // Transit Break Bulk Import
  "TRANSIT_IMPORT_BREAKBULK": [
    { days: 30, rate20: 1.00, rate40: 1.00 },
    { days: Infinity, rate20: 1.50, rate40: 1.50 },
  ],
  // Transit Break Bulk Export
  "TRANSIT_EXPORT_BREAKBULK": [
    { days: Infinity, rate20: 0.50, rate40: 0.50 },
  ],
  // Empty containers
  "EMPTY": [
    { days: 10, rate20: 4, rate40: 8 },
    { days: Infinity, rate20: 8, rate40: 16 },
  ],
  // ICD Port Extension mode - Local Import
  "ICD_LOCAL_IMPORT": [
    { days: 14, rate20: 20, rate40: 40 },
    { days: Infinity, rate20: 40, rate40: 80 },
  ],
  // ICD Port Extension mode - Transit Import
  "ICD_TRANSIT_IMPORT": [
    { days: 14, rate20: 20, rate40: 40 },
    { days: Infinity, rate20: 40, rate40: 80 },
  ],
  // ICD General Cargo (per HTN/day)
  "ICD_LOCAL_GENERAL": [
    { days: Infinity, rate20: 0.50, rate40: 0.50 },
  ],
  "ICD_TRANSIT_GENERAL": [
    { days: Infinity, rate20: 0.50, rate40: 0.50 },
  ],
  // Transshipment containers (Clause 39 - 15 days free)
  "TRANSSHIPMENT_FCL": [
    { days: Infinity, rate20: 15, rate40: 30 },
  ],
  // Coastwise break bulk
  "COASTWISE_BREAKBULK": [
    { days: Infinity, rate20: 0.30, rate40: 0.30 },
  ],
}

/**
 * Calculate the number of calendar days between two dates.
 */
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay)
}

/**
 * Get the free period in days for a given cargo type.
 */
export function getFreePeriodDays(params: StorageParams): number {
  // Reefer storage: 48 hours = 2 days
  if (params.isReefer) return 2

  // DG storage: 24 hours = 1 day
  if (params.isDangerous) return 1

  // ICD Port Extension mode
  if (params.isICDPortExtension) {
    if (params.trafficType === "TRANSIT_IMPORT") {
      return params.cargoForm === "FCL" ? FREE_PERIODS["ICD_TRANSIT_IMPORT"] : FREE_PERIODS["ICD_TRANSIT_GENERAL"]
    }
    return params.cargoForm === "FCL" ? FREE_PERIODS["ICD_LOCAL_IMPORT"] : FREE_PERIODS["ICD_LOCAL_GENERAL"]
  }

  // Empty containers
  if (params.cargoForm === "EMPTY") return FREE_PERIODS["EMPTY"]

  // Standard free periods
  const key = `${params.trafficType}_${params.cargoForm}`
  return FREE_PERIODS[key] ?? 5
}

/**
 * Get the storage rate tier key for lookup.
 */
function getTierKey(params: StorageParams): string {
  if (params.isICDPortExtension) {
    if (params.trafficType === "TRANSIT_IMPORT") {
      return params.cargoForm === "FCL" ? "ICD_TRANSIT_IMPORT" : "ICD_TRANSIT_GENERAL"
    }
    return params.cargoForm === "FCL" ? "ICD_LOCAL_IMPORT" : "ICD_LOCAL_GENERAL"
  }

  if (params.cargoForm === "EMPTY") return "EMPTY"

  const key = `${params.trafficType}_${params.cargoForm}`
  return STORAGE_TIERS[key] ? key : "DOMESTIC_IMPORT_FCL" // fallback
}

/**
 * Calculate storage charges based on TPA Tariff Book Clause 32.
 *
 * Handles:
 * - Free period calculation (domestic 5 days, transit 15/21 days, ICD 30/60 days)
 * - Tiered daily rates after free period expiry
 * - DG surcharge (+20% on storage after 24hr free)
 * - Container size differentials (20ft vs 40ft)
 * - Break bulk per HTN/day rates
 * - ICD port extension mode rates
 */
export function calculateStorage(params: StorageParams, quantity = 1): StorageCalculation {
  const checkOut = params.checkOutDate ?? new Date()
  const totalDays = daysBetween(params.checkInDate, checkOut)
  const freePeriodDays = getFreePeriodDays(params)
  const chargeableDays = Math.max(0, totalDays - freePeriodDays)

  const tierKey = getTierKey(params)
  const rateTiers = STORAGE_TIERS[tierKey] ?? STORAGE_TIERS["DOMESTIC_IMPORT_FCL"]

  const is40ft = params.containerSize === "40"
  const tiers: StorageTier[] = []
  let remainingDays = chargeableDays
  let baseStorageCharge = 0

  for (const tier of rateTiers) {
    if (remainingDays <= 0) break

    const daysInTier = tier.days === Infinity ? remainingDays : Math.min(remainingDays, tier.days)
    const dailyRate = is40ft ? tier.rate40 : tier.rate20
    const tierTotal = daysInTier * dailyRate * quantity

    tiers.push({
      label: tier.days === Infinity ? "Thereafter" : `Next ${tier.days} days`,
      days: daysInTier,
      dailyRate,
      tierTotal,
    })

    baseStorageCharge += tierTotal
    remainingDays -= daysInTier
  }

  // DG surcharge: +20% on storage (after 24hr free period)
  const dgSurchargeAmount = params.isDangerous ? baseStorageCharge * 0.20 : 0
  const totalCharge = baseStorageCharge + dgSurchargeAmount

  let clauseReference = "Clause 32"
  if (params.isICDPortExtension) clauseReference = "Clause 42 (Storage per Clause 32)"
  if (params.isDangerous) clauseReference += " (+20% DG surcharge)"

  return {
    totalDays,
    freePeriodDays,
    chargeableDays,
    tiers,
    baseStorageCharge,
    dgSurchargeAmount,
    totalCharge,
    clauseReference,
  }
}

/**
 * Calculate reefer power supply charges (Clause 39).
 * $8/day for 20ft, $12/day for 40ft.
 */
export function calculateReeferPower(
  containerSize: "20" | "40",
  connectDate: Date,
  disconnectDate?: Date
): { days: number; dailyRate: number; totalCharge: number; clauseReference: string } {
  const end = disconnectDate ?? new Date()
  const days = Math.max(1, daysBetween(connectDate, end))
  const dailyRate = containerSize === "40" ? 12.0 : 8.0

  return {
    days,
    dailyRate,
    totalCharge: days * dailyRate,
    clauseReference: "Clause 39 - Reefer Power Supply",
  }
}

/**
 * Calculate reefer storage charges (Clause 39).
 * After 48hr free: $20/day for 20ft, $40/day for 40ft.
 */
export function calculateReeferStorage(
  containerSize: "20" | "40",
  checkInDate: Date,
  checkOutDate?: Date
): StorageCalculation {
  return calculateStorage({
    trafficType: "DOMESTIC_IMPORT",
    cargoForm: "FCL",
    containerSize,
    isReefer: true,
    checkInDate,
    checkOutDate,
  })
}

/**
 * Get a human-readable summary of free period for display.
 */
export function getFreePeriodSummary(trafficType: TrafficType, cargoForm: CargoForm, isDG = false, isReefer = false): string {
  if (isReefer) return "48 hours"
  if (isDG) return "24 hours"

  const days = getFreePeriodDays({
    trafficType,
    cargoForm,
    checkInDate: new Date(),
  })
  return `${days} days`
}
