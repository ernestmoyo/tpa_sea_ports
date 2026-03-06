export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Package, Plus } from "lucide-react"
import Link from "next/link"
import { SearchInput } from "@/components/shared/search-input"

async function getCargoData(q?: string) {
  const cargos = await prisma.cargo.findMany({
    where: q ? { OR: [{ description: { contains: q, mode: "insensitive" } }, { hsCode: { contains: q, mode: "insensitive" } }] } : {},
    include: {
      customer: true,
      containers: { include: { container: true } },
      dangerousGoods: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const stats = await Promise.all([
    prisma.cargo.count(),
    prisma.cargo.count({ where: { isDangerous: true } }),
    prisma.cargo.count({ where: { isColdStorage: true } }),
    prisma.cargo.count({ where: { isValuable: true } }),
    prisma.cargo.aggregate({ _sum: { harbourTonnes: true } }),
  ])

  const byType = await prisma.cargo.groupBy({ by: ["cargoType"], _count: true })

  return {
    cargos,
    total: stats[0],
    dangerous: stats[1],
    cold: stats[2],
    valuable: stats[3],
    totalHTN: Number(stats[4]._sum.harbourTonnes ?? 0),
    byType,
  }
}

const typeColors: Record<string, string> = {
  DOMESTIC_IMPORT: "bg-blue-100 text-blue-700",
  DOMESTIC_EXPORT: "bg-green-100 text-green-700",
  TRANSIT_IMPORT: "bg-indigo-100 text-indigo-700",
  TRANSIT_EXPORT: "bg-purple-100 text-purple-700",
  TRANSSHIPMENT: "bg-yellow-100 text-yellow-700",
  COASTWISE: "bg-cyan-100 text-cyan-700",
}

export default async function CargoPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const data = await getCargoData(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Package className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Cargo Operations</h1>
          </div>
          <p className="text-sm text-gray-500">Cargo registration, classification & harbour tonne calculations</p>
        </div>
        <Link
          href="/cargo/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Register Cargo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{data.total}</p>
          <p className="text-sm text-gray-500">Total Cargo Items</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{data.totalHTN.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Harbour Tonnes</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{data.dangerous}</p>
          <p className="text-sm text-gray-500">Dangerous Goods</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-cyan-600">{data.cold}</p>
          <p className="text-sm text-gray-500">Cold Storage</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{data.valuable}</p>
          <p className="text-sm text-gray-500">Valuable Cargo</p>
        </div>
      </div>

      {/* By traffic type */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {data.byType.map((t) => (
          <span key={t.cargoType} className={`text-xs px-3 py-1 rounded-full font-medium ${typeColors[t.cargoType] ?? "bg-gray-100 text-gray-700"}`}>
            {t.cargoType.replace(/_/g, " ")} ({t._count})
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput placeholder="Search cargo..." />
      </div>

      {/* Cargo table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Description</th>
              <th className="text-left p-3 font-medium text-gray-700">Type</th>
              <th className="text-left p-3 font-medium text-gray-700">HS Code</th>
              <th className="text-right p-3 font-medium text-gray-700">Weight (kg)</th>
              <th className="text-right p-3 font-medium text-gray-700">HTN</th>
              <th className="text-right p-3 font-medium text-gray-700">CIF Value</th>
              <th className="text-left p-3 font-medium text-gray-700">Customer</th>
              <th className="text-center p-3 font-medium text-gray-700">Flags</th>
            </tr>
          </thead>
          <tbody>
            {data.cargos.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  No cargo registered yet.
                </td>
              </tr>
            ) : (
              data.cargos.map((cargo) => (
                <tr key={cargo.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3 font-medium max-w-[200px] truncate"><Link href={`/cargo/${cargo.id}`} className="text-blue-600 hover:underline">{cargo.description}</Link></td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[cargo.cargoType]}`}>
                      {cargo.cargoType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-600">{cargo.hsCode ?? "—"}</td>
                  <td className="p-3 text-right font-mono text-gray-900">{Number(cargo.weightKg).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-semibold text-gray-900">{Number(cargo.harbourTonnes).toFixed(2)}</td>
                  <td className="p-3 text-right text-gray-600">
                    {cargo.cifValueUsd ? formatCurrency(Number(cargo.cifValueUsd)) : "—"}
                  </td>
                  <td className="p-3 text-gray-700">{cargo.customer?.name ?? "—"}</td>
                  <td className="p-3 text-center space-x-1">
                    {cargo.isDangerous && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">DG</span>}
                    {cargo.isColdStorage && <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-medium">Cold</span>}
                    {cargo.isValuable && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Val</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
