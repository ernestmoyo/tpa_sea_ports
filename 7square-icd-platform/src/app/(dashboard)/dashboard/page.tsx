export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Container, Package, Warehouse, Receipt, Ship, AlertTriangle, Thermometer, Clock, TrendingUp, Users, FileText, DollarSign } from "lucide-react"
import Link from "next/link"

async function getDashboardData() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalContainers,
    inStorageContainers,
    reeferContainers,
    dgContainers,
    customerCount,
    warehouseData,
    invoiceStats,
    tariffClauses,
    tariffRates,
    activeBookings,
    recentContainers,
    slaLogs,
    overdueInvoices,
    invoiceCount,
    reeferAlerts,
  ] = await Promise.all([
    prisma.container.count(),
    prisma.container.count({ where: { status: "IN_STORAGE" } }),
    prisma.container.count({ where: { containerType: "REEFER" } }),
    prisma.container.count({ where: { dangerousGoods: { some: {} } } }),
    prisma.customer.count(),
    prisma.warehouse.findMany({
      where: { isActive: true },
      select: { totalCapacityTeu: true, currentOccupancy: true },
    }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { status: "PAID", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.tariffClause.count(),
    prisma.tariffRate.count(),
    prisma.storageBooking.count({ where: { status: "ACTIVE" } }),
    prisma.container.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { id: true },
    }),
    prisma.sLALog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { metTarget: true },
    }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.invoice.count(),
    prisma.reeferMonitoring.count({
      where: { alertGenerated: true, timestamp: { gte: thirtyDaysAgo } },
    }),
  ])

  // Calculate dwell time from active storage bookings
  const activeStorageBookings = await prisma.storageBooking.findMany({
    where: { status: "ACTIVE" },
    select: { checkInDate: true },
  })
  const avgDwellDays = activeStorageBookings.length > 0
    ? Math.round(
        activeStorageBookings.reduce((sum, b) => {
          return sum + (now.getTime() - new Date(b.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / activeStorageBookings.length
      )
    : 0

  const totalCapacity = warehouseData.reduce((s, w) => s + w.totalCapacityTeu, 0)
  const totalOccupancy = warehouseData.reduce((s, w) => s + w.currentOccupancy, 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0

  const slaCompliance = slaLogs.length > 0
    ? Math.round((slaLogs.filter((s) => s.metTarget).length / slaLogs.length) * 100)
    : 0

  return {
    totalContainers,
    inStorageContainers,
    reeferContainers,
    dgContainers,
    customerCount,
    warehouseCount: warehouseData.length,
    occupancyRate,
    revenue30d: Number(invoiceStats._sum.totalAmount ?? 0),
    invoicesPaid30d: invoiceStats._count,
    tariffClauses,
    tariffRates,
    activeBookings,
    teuThroughput30d: recentContainers.length,
    avgDwellDays,
    slaCompliance,
    slaTotal: slaLogs.length,
    invoiceCount,
    overdueInvoices,
    reeferAlerts,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          7Square ICD Operations Overview — TPA Tariff Book Feb 2024
        </p>
      </div>

      {/* Primary KPIs — SOP-aligned */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Link href="/containers" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Container className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{data.totalContainers}</p>
              <p className="text-xs text-gray-500">Active Containers</p>
            </div>
          </div>
        </Link>
        <Link href="/customers" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{data.customerCount}</p>
              <p className="text-xs text-gray-500">Customers</p>
            </div>
          </div>
        </Link>
        <Link href="/warehouse" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
              <Warehouse className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{data.warehouseCount}</p>
              <p className="text-xs text-gray-500">Warehouses</p>
            </div>
          </div>
        </Link>
        <Link href="/billing" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-yellow-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{data.invoiceCount}</p>
              <p className="text-xs text-gray-500">Invoices</p>
            </div>
          </div>
        </Link>
        <Link href="/tariffs" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-purple-600">{data.tariffClauses}</p>
              <p className="text-xs text-gray-500">TPA Tariff Clauses</p>
            </div>
          </div>
        </Link>
        <Link href="/tariffs" className="bg-white rounded-lg border border-gray-200 p-4 hover:border-cyan-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-cyan-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-cyan-600">{data.tariffRates}</p>
              <p className="text-xs text-gray-500">Tariff Rates Loaded</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Alerts row */}
      {(data.overdueInvoices > 0 || data.reeferAlerts > 0) && (
        <div className="flex gap-3 mb-6">
          {data.overdueInvoices > 0 && (
            <Link href="/billing" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-800">
              <Receipt className="h-4 w-4" />
              {data.overdueInvoices} overdue invoice{data.overdueInvoices > 1 ? "s" : ""}
            </Link>
          )}
          {data.reeferAlerts > 0 && (
            <Link href="/reefer" className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm text-orange-800">
              <Thermometer className="h-4 w-4" />
              {data.reeferAlerts} reefer alert{data.reeferAlerts > 1 ? "s" : ""} (30d)
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* UNCTAD KPIs */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            UNCTAD Port Performance Indicators
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Average Dwell Time</span>
                <span className="text-sm font-bold text-gray-900">{data.avgDwellDays} days</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${data.avgDwellDays > 10 ? "bg-red-500" : data.avgDwellDays > 5 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(data.avgDwellDays * 5, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">TEU Throughput (30 days)</span>
                <span className="text-sm font-bold text-gray-900">{data.teuThroughput30d} TEU</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Warehouse Occupancy Rate</span>
                <span className={`text-sm font-bold ${data.occupancyRate > 80 ? "text-red-600" : "text-green-600"}`}>{data.occupancyRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${data.occupancyRate > 80 ? "bg-red-500" : data.occupancyRate > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${data.occupancyRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">SLA Compliance Rate</span>
                <span className={`text-sm font-bold ${data.slaCompliance >= 90 ? "text-green-600" : data.slaCompliance >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                  {data.slaCompliance > 0 ? `${data.slaCompliance}%` : "N/A"}{data.slaTotal > 0 ? ` (${data.slaTotal} records)` : ""}
                </span>
              </div>
              {data.slaTotal > 0 && (
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${data.slaCompliance >= 90 ? "bg-green-500" : data.slaCompliance >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${data.slaCompliance}%` }}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Storage Bookings</span>
              <span className="text-sm font-bold text-gray-900">{data.activeBookings}</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">TPA Tariff Book</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Feb 2024 — {data.tariffClauses} clauses, {data.tariffRates} rates
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">IMDG Code Compliance</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">SOLAS VGM Tracking</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Surcharge Rules</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                DG 10%/20% | OD 30% | Cold 30%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Warehouses</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {data.warehouseCount} active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Invoices Paid (30d)</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {data.invoicesPaid30d} — {formatCurrency(data.revenue30d)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
