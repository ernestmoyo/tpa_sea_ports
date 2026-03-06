export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { BarChart3, TrendingUp, Clock, Anchor, Warehouse } from "lucide-react"

async function getKPIs() {
  const [
    containerCount,
    activeStorageBookings,
    warehouseData,
    invoiceRevenue,
    avgDwellDays,
    slaCompliance,
    cargoByType,
    recentInvoices,
  ] = await Promise.all([
    prisma.container.count(),
    prisma.storageBooking.count({ where: { status: "ACTIVE" } }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      select: { totalCapacityTeu: true, currentOccupancy: true },
    }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID" },
    }),
    // Average dwell time: active bookings
    prisma.storageBooking.findMany({
      where: { status: "ACTIVE" },
      select: { checkInDate: true },
    }),
    // SLA compliance
    prisma.sLALog.findMany({
      select: { metTarget: true },
    }),
    // Cargo by type
    prisma.cargo.groupBy({
      by: ["cargoType"],
      _count: true,
      _sum: { harbourTonnes: true },
    }),
    // Recent invoices for revenue trend
    prisma.invoice.findMany({
      where: { status: "PAID" },
      select: { totalAmount: true, issuedDate: true },
      orderBy: { issuedDate: "desc" },
      take: 30,
    }),
  ])

  const totalCapacity = warehouseData.reduce((sum, w) => sum + w.totalCapacityTeu, 0)
  const totalOccupancy = warehouseData.reduce((sum, w) => sum + w.currentOccupancy, 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0

  // Calculate average dwell time
  const now = new Date()
  const dwellDays = avgDwellDays.map((b) =>
    Math.ceil((now.getTime() - b.checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  )
  const avgDwell = dwellDays.length > 0 ? Math.round(dwellDays.reduce((a, b) => a + b, 0) / dwellDays.length) : 0

  // SLA compliance rate
  const slaTotal = slaCompliance.length
  const slaMet = slaCompliance.filter((s) => s.metTarget).length
  const slaRate = slaTotal > 0 ? Math.round((slaMet / slaTotal) * 100) : 0

  const totalRevenue = Number(invoiceRevenue._sum.totalAmount ?? 0)

  return {
    containerCount,
    activeStorageBookings,
    occupancyRate,
    totalCapacity,
    totalOccupancy,
    totalRevenue,
    avgDwell,
    slaRate,
    slaTotal,
    cargoByType,
  }
}

export default async function ReportsPage() {
  const kpis = await getKPIs()

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Reports & UNCTAD KPIs</h1>
        </div>
        <p className="text-sm text-gray-500">
          Port performance indicators aligned to UNCTAD standards
        </p>
      </div>

      {/* UNCTAD KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-700">Avg Dwell Time</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.avgDwell}</p>
          <p className="text-sm text-gray-500">days</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Anchor className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-medium text-gray-700">TEU Throughput</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.containerCount}</p>
          <p className="text-sm text-gray-500">containers registered</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Warehouse className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-700">Warehouse Occupancy</h3>
          </div>
          <p className={`text-3xl font-bold ${kpis.occupancyRate > 80 ? "text-red-600" : "text-green-600"}`}>
            {kpis.occupancyRate}%
          </p>
          <p className="text-sm text-gray-500">{kpis.totalOccupancy}/{kpis.totalCapacity} TEU</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-700">SLA Compliance</h3>
          </div>
          <p className={`text-3xl font-bold ${kpis.slaRate >= 90 ? "text-green-600" : kpis.slaRate >= 70 ? "text-yellow-600" : "text-red-600"}`}>
            {kpis.slaRate}%
          </p>
          <p className="text-sm text-gray-500">{kpis.slaTotal} operations tracked</p>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Revenue Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Revenue Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(kpis.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Storage Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.activeStorageBookings}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Containers in System</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.containerCount}</p>
          </div>
        </div>
      </div>

      {/* Cargo by Type */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Cargo Volume by Traffic Type</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 font-medium text-gray-700">Traffic Type</th>
                <th className="text-right p-2 font-medium text-gray-700">Count</th>
                <th className="text-right p-2 font-medium text-gray-700">Total HTN</th>
              </tr>
            </thead>
            <tbody>
              {kpis.cargoByType.map((ct) => (
                <tr key={ct.cargoType} className="border-t border-gray-100">
                  <td className="p-2 text-gray-900 font-medium">{ct.cargoType.replace(/_/g, " ")}</td>
                  <td className="p-2 text-right text-gray-900">{ct._count}</td>
                  <td className="p-2 text-right font-mono text-gray-900">
                    {Number(ct._sum.harbourTonnes ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNCTAD Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">UNCTAD Port Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
          <div>
            <p>Berth Occupancy Rate — % of time berths are occupied</p>
            <p>Ship Turnaround Time — arrival to departure (hours)</p>
            <p>Cargo Dwell Time — discharge to gate-out (days)</p>
          </div>
          <div>
            <p>TEU Throughput — containers handled per period</p>
            <p>Crane Productivity — moves per crane per hour</p>
            <p>Truck Turnaround — gate-in to gate-out (minutes)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
