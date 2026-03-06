export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Ship, Plus, Anchor } from "lucide-react"
import Link from "next/link"
import { SearchInput } from "@/components/shared/search-input"

async function getVessels(q?: string) {
  const vessels = await prisma.vessel.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { imoNumber: { contains: q, mode: "insensitive" } }] } : {},
    include: {
      vesselCalls: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { vesselCalls: true } },
    },
    orderBy: { name: "asc" },
  })

  const activeCalls = await prisma.vesselCall.findMany({
    where: { status: { in: ["EXPECTED", "ARRIVED", "BERTHED", "WORKING"] } },
    include: { vessel: true },
    orderBy: { eta: "asc" },
  })

  return { vessels, activeCalls }
}

const callStatusColors: Record<string, string> = {
  EXPECTED: "bg-blue-100 text-blue-700",
  ARRIVED: "bg-yellow-100 text-yellow-700",
  BERTHED: "bg-green-100 text-green-700",
  WORKING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  DEPARTED: "bg-gray-100 text-gray-500",
}

export default async function VesselsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const { vessels, activeCalls } = await getVessels(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Ship className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Vessel Registry</h1>
          </div>
          <p className="text-sm text-gray-500">Vessel tracking with GRT/DWT for tariff charge calculations</p>
        </div>
        <Link
          href="/vessels/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Register Vessel
        </Link>
      </div>

      {/* Active Vessel Calls */}
      {activeCalls.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Anchor className="h-5 w-5 text-blue-600" />
            Active Vessel Calls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCalls.map((call) => (
              <div key={call.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{call.vessel.name}</p>
                    <p className="text-xs text-gray-500">
                      {call.vessel.imoNumber ? `IMO ${call.vessel.imoNumber}` : call.vessel.vesselType}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${callStatusColors[call.status]}`}>
                    {call.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  {call.berth && <p>Berth: {call.berth}</p>}
                  {call.eta && <p>ETA: {formatDate(call.eta)}</p>}
                  {call.voyageNumber && <p>Voyage: {call.voyageNumber}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <SearchInput placeholder="Search vessels..." />
      </div>

      {/* Vessel Registry Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Vessel Name</th>
              <th className="text-left p-3 font-medium text-gray-700">IMO #</th>
              <th className="text-left p-3 font-medium text-gray-700">Type</th>
              <th className="text-right p-3 font-medium text-gray-700">GRT</th>
              <th className="text-right p-3 font-medium text-gray-700">DWT</th>
              <th className="text-right p-3 font-medium text-gray-700">LOA (m)</th>
              <th className="text-left p-3 font-medium text-gray-700">Flag</th>
              <th className="text-center p-3 font-medium text-gray-700">Coaster</th>
              <th className="text-right p-3 font-medium text-gray-700">Calls</th>
            </tr>
          </thead>
          <tbody>
            {vessels.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  No vessels registered yet.
                </td>
              </tr>
            ) : (
              vessels.map((v) => (
                <tr key={v.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3 font-medium"><Link href={`/vessels/${v.id}`} className="text-blue-600 hover:underline">{v.name}</Link></td>
                  <td className="p-3 font-mono text-gray-600">{v.imoNumber ?? "—"}</td>
                  <td className="p-3 text-gray-600">{v.vesselType.replace(/_/g, " ")}</td>
                  <td className="p-3 text-right font-mono text-gray-900">{Number(v.grt).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-gray-600">{v.dwt ? Number(v.dwt).toLocaleString() : "—"}</td>
                  <td className="p-3 text-right text-gray-600">{v.loa ? Number(v.loa) : "—"}</td>
                  <td className="p-3 text-gray-600">{v.flagState ?? "—"}</td>
                  <td className="p-3 text-center">{v.isCoaster ? "Yes" : "—"}</td>
                  <td className="p-3 text-right text-gray-500">{v._count.vesselCalls}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
