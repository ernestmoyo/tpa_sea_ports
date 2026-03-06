export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { BookOpen, Search, ChevronRight } from "lucide-react"
import { SearchInput } from "@/components/shared/search-input"

async function getTariffData(q?: string) {
  const whereClause = q
    ? {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { rates: { some: { serviceName: { contains: q, mode: "insensitive" as const } } } },
        ],
      }
    : { isActive: true }

  const clauses = await prisma.tariffClause.findMany({
    where: whereClause,
    include: {
      rates: { where: { isActive: true }, orderBy: { serviceCode: "asc" } },
      _count: { select: { rates: true } },
    },
    orderBy: { clauseNumber: "asc" },
  })

  const surcharges = await prisma.tariffSurcharge.findMany({
    where: { isActive: true },
  })

  const freePeriods = await prisma.tariffFreePeriod.findMany({
    include: { clause: true },
  })

  return { clauses, surcharges, freePeriods }
}

function formatRateUnit(unit: string): string {
  const labels: Record<string, string> = {
    PER_HTN: "/HTN",
    PER_DWT: "/DWT",
    PER_TEU: "/TEU",
    PER_CONTAINER_20FT: "/20ft unit",
    PER_CONTAINER_40FT: "/40ft unit",
    PER_100_GRT: "/100 GRT",
    PER_GRT: "/GRT",
    PER_HOUR: "/hour",
    PER_DAY: "/day",
    PER_SHIFT: "/shift",
    PER_OPERATION: "/operation",
    PER_CALL: "/call",
    PER_TRIP: "/trip",
    PER_MAN_HOUR: "/man-hour",
    PER_MINUTE: "/minute",
    PER_PACKAGE: "/package",
    PER_BAG: "/bag",
    PER_ANIMAL: "/animal",
    PER_LITRE: "/1000L",
    PER_METRE: "/metre",
    PER_PERSON: "/person",
    AD_VALOREM: "% ad valorem",
    FIXED: "fixed",
    PER_TONNE_CAPACITY: "/ton capacity",
    PER_RECEPTACLE: "/receptacle",
    PER_50KG: "/50kg",
  }
  return labels[unit] ?? unit
}

export default async function TariffsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const { clauses, surcharges, freePeriods } = await getTariffData(q)

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">TPA Tariff Book</h1>
        </div>
        <p className="text-sm text-gray-500">
          Tanzania Ports Authority — Schedule of Port Charges, Fees and Dues (Feb 2024)
        </p>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-md">
        <SearchInput placeholder="Search clauses, services, rates..." />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{clauses.length}</p>
          <p className="text-sm text-gray-500">Tariff Clauses</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">
            {clauses.reduce((sum, c) => sum + c._count.rates, 0)}
          </p>
          <p className="text-sm text-gray-500">Rate Items Loaded</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{surcharges.length}</p>
          <p className="text-sm text-gray-500">Surcharge Rules</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{freePeriods.length}</p>
          <p className="text-sm text-gray-500">Free Period Rules</p>
        </div>
      </div>

      {/* Surcharge Rules Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Global Surcharge Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {surcharges.map((s) => (
            <div key={s.id} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{s.description}</p>
              <p className="text-lg font-bold text-red-600">+{Number(s.percentage)}%</p>
              <p className="text-xs text-gray-500">
                Applies to: {s.appliesToClauses.map((c) => `Cl.${c}`).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Free Period Rules */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Free Storage Periods</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 font-medium text-gray-700">Cargo Type</th>
                <th className="text-left p-2 font-medium text-gray-700">Container</th>
                <th className="text-right p-2 font-medium text-gray-700">Free Days</th>
                <th className="text-left p-2 font-medium text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {freePeriods.map((fp) => (
                <tr key={fp.id} className="border-t border-gray-100">
                  <td className="p-2 text-gray-900">{fp.cargoClass.replace(/_/g, " ")}</td>
                  <td className="p-2 text-gray-600">{fp.containerSize ? `${fp.containerSize}ft` : "All"}</td>
                  <td className="p-2 text-right font-semibold text-green-700">
                    {fp.freeHours ? `${fp.freeHours}hr` : `${fp.freeDays}d`}
                  </td>
                  <td className="p-2 text-gray-500">{fp.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clause-by-clause rate tables */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">All Clauses & Rates</h2>
        {clauses.map((clause) => (
          <details key={clause.id} className="bg-white rounded-lg border border-gray-200">
            <summary className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                  Cl.{clause.clauseNumber}
                </span>
                <span className="font-medium text-gray-900">{clause.title}</span>
                <span className="text-xs text-gray-400">{clause._count.rates} rates</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </summary>

            <div className="border-t border-gray-200 p-4">
              {clause.description && (
                <p className="text-sm text-gray-600 mb-3">{clause.description}</p>
              )}

              {clause.rates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 font-medium text-gray-700">Service</th>
                        <th className="text-left p-2 font-medium text-gray-700">Vessel</th>
                        <th className="text-left p-2 font-medium text-gray-700">Cargo Class</th>
                        <th className="text-left p-2 font-medium text-gray-700">Container</th>
                        <th className="text-right p-2 font-medium text-gray-700">Rate (USD)</th>
                        <th className="text-left p-2 font-medium text-gray-700">Unit</th>
                        <th className="text-right p-2 font-medium text-gray-700">Min.</th>
                        <th className="text-left p-2 font-medium text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clause.rates.map((rate) => (
                        <tr key={rate.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                          <td className="p-2">
                            <p className="text-gray-900 font-medium">{rate.serviceName}</p>
                            <p className="text-xs text-gray-400">{rate.serviceCode}</p>
                          </td>
                          <td className="p-2 text-gray-600">{rate.vesselCategory === "ALL" ? "—" : rate.vesselCategory.replace(/_/g, " ")}</td>
                          <td className="p-2 text-gray-600">{rate.cargoClass === "ALL" ? "—" : rate.cargoClass.replace(/_/g, " ")}</td>
                          <td className="p-2 text-gray-600">
                            {rate.containerSize ? `${rate.containerSize}ft` : "—"}
                            {rate.containerLoadType !== "ALL" ? ` ${rate.containerLoadType}` : ""}
                          </td>
                          <td className="p-2 text-right font-mono font-semibold text-gray-900">
                            {rate.rateUnit === "AD_VALOREM"
                              ? `${Number(rate.rateAmount)}%`
                              : formatCurrency(Number(rate.rateAmount))}
                          </td>
                          <td className="p-2 text-gray-500 text-xs">{formatRateUnit(rate.rateUnit)}</td>
                          <td className="p-2 text-right text-gray-600">
                            {rate.minimumAmount ? formatCurrency(Number(rate.minimumAmount)) : "—"}
                          </td>
                          <td className="p-2 text-xs text-gray-500 max-w-[200px] truncate">{rate.notes ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No rates loaded for this clause.</p>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
