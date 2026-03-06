export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Thermometer, Zap, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ReeferPowerButton, TempLogButton } from "@/components/shared/reefer-actions"

async function getReeferData() {
  const reeferContainers = await prisma.container.findMany({
    where: { containerType: "REEFER" },
    include: {
      customer: true,
      reeferLogs: { orderBy: { timestamp: "desc" }, take: 1 },
      reeferPowerLogs: { where: { disconnectDate: null } },
      storageBookings: { where: { status: "ACTIVE" } },
    },
    orderBy: { createdAt: "desc" },
  })

  const alerts = await prisma.reeferMonitoring.findMany({
    where: { alertGenerated: true },
    include: { container: true },
    orderBy: { timestamp: "desc" },
    take: 10,
  })

  const activePower = await prisma.reeferPowerLog.count({
    where: { disconnectDate: null },
  })

  return { reeferContainers, alerts, activePower }
}

const sizeLabels: Record<string, string> = {
  SIZE_20: "20ft",
  SIZE_40: "40ft",
  SIZE_45: "45ft",
}

export default async function ReeferPage() {
  const { reeferContainers, alerts, activePower } = await getReeferData()

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Thermometer className="h-6 w-6 text-cyan-600" />
          <h1 className="text-2xl font-bold text-gray-900">Reefer Monitoring</h1>
        </div>
        <p className="text-sm text-gray-500">
          Temperature monitoring & power supply tracking — Clause 39 rates: $8/day (20ft), $12/day (40ft)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-cyan-600">{reeferContainers.length}</p>
          <p className="text-sm text-gray-500">Reefer Containers</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{activePower}</p>
          </div>
          <p className="text-sm text-gray-500">Connected to Power</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">{alerts.length}</p>
          <p className="text-sm text-gray-500">Recent Alerts</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700">Storage after 48hr free</p>
          <p className="text-lg font-bold text-gray-900">$20/$40 per day</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            Temperature Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex justify-between items-center text-sm">
                <span className="font-mono text-orange-700">{a.container.containerNumber}</span>
                <span className="text-orange-600">{a.alertMessage}</span>
                <span className="text-xs text-orange-500">{formatDate(a.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reefer container list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Container #</th>
              <th className="text-left p-3 font-medium text-gray-700">Size</th>
              <th className="text-left p-3 font-medium text-gray-700">Status</th>
              <th className="text-right p-3 font-medium text-gray-700">Set Temp</th>
              <th className="text-right p-3 font-medium text-gray-700">Actual Temp</th>
              <th className="text-center p-3 font-medium text-gray-700">Power</th>
              <th className="text-left p-3 font-medium text-gray-700">Customer</th>
              <th className="text-right p-3 font-medium text-gray-700">Daily Rate</th>
              <th className="text-center p-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reeferContainers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  No reefer containers registered.
                </td>
              </tr>
            ) : (
              reeferContainers.map((c) => {
                const latestLog = c.reeferLogs[0]
                const powerLog = c.reeferPowerLogs[0]
                const dailyRate = c.size === "SIZE_40" || c.size === "SIZE_45" ? 12 : 8

                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-cyan-50/30">
                    <td className="p-3 font-mono font-medium">
                      <Link href={`/containers/${c.id}`} className="text-blue-600 hover:underline">{c.containerNumber}</Link>
                    </td>
                    <td className="p-3 text-gray-600">{sizeLabels[c.size]}</td>
                    <td className="p-3">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-gray-900">
                      {latestLog ? `${Number(latestLog.setTemperature)}°C` : "—"}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {latestLog ? (
                        <span className={Math.abs(Number(latestLog.actualTemperature) - Number(latestLog.setTemperature)) > 3 ? "text-red-600 font-bold" : "text-gray-900"}>
                          {Number(latestLog.actualTemperature)}°C
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-3 text-center">
                      {powerLog ? (
                        <span className="text-green-600 font-bold">ON</span>
                      ) : (
                        <span className="text-gray-400">OFF</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-700">{c.customer?.name ?? "—"}</td>
                    <td className="p-3 text-right font-mono text-gray-900">{formatCurrency(dailyRate)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ReeferPowerButton containerId={c.id} containerNumber={c.containerNumber} isConnected={!!powerLog} />
                        <TempLogButton containerId={c.id} />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
