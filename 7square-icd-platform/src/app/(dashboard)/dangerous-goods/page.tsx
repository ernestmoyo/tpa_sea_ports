export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { AlertTriangle, Shield, Plus } from "lucide-react"
import Link from "next/link"
import { SearchInput } from "@/components/shared/search-input"

async function getDGData(q?: string) {
  const dangerousGoods = await prisma.dangerousGoods.findMany({
    where: q ? { OR: [{ unNumber: { contains: q, mode: "insensitive" } }, { properShippingName: { contains: q, mode: "insensitive" } }] } : {},
    include: {
      container: true,
      cargo: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const byClass = await prisma.dangerousGoods.groupBy({
    by: ["imdgClass"],
    _count: true,
    orderBy: { imdgClass: "asc" },
  })

  const total = await prisma.dangerousGoods.count()

  return { dangerousGoods, byClass, total }
}

const imdgLabels: Record<string, string> = {
  CLASS_1: "1 - Explosives",
  CLASS_2_1: "2.1 - Flammable Gases",
  CLASS_2_2: "2.2 - Non-Flammable Gases",
  CLASS_2_3: "2.3 - Toxic Gases",
  CLASS_3: "3 - Flammable Liquids",
  CLASS_4_1: "4.1 - Flammable Solids",
  CLASS_4_2: "4.2 - Spontaneously Combustible",
  CLASS_4_3: "4.3 - Dangerous When Wet",
  CLASS_5_1: "5.1 - Oxidizing Substances",
  CLASS_5_2: "5.2 - Organic Peroxides",
  CLASS_6_1: "6.1 - Toxic Substances",
  CLASS_6_2: "6.2 - Infectious Substances",
  CLASS_7: "7 - Radioactive Material",
  CLASS_8: "8 - Corrosives",
  CLASS_9: "9 - Miscellaneous",
}

const imdgColors: Record<string, string> = {
  CLASS_1: "bg-red-600",
  CLASS_2_1: "bg-red-500",
  CLASS_2_2: "bg-green-500",
  CLASS_2_3: "bg-gray-600",
  CLASS_3: "bg-red-400",
  CLASS_4_1: "bg-red-300",
  CLASS_4_2: "bg-red-300",
  CLASS_4_3: "bg-blue-500",
  CLASS_5_1: "bg-yellow-500",
  CLASS_5_2: "bg-yellow-400",
  CLASS_6_1: "bg-gray-500",
  CLASS_6_2: "bg-gray-500",
  CLASS_7: "bg-yellow-300",
  CLASS_8: "bg-gray-700",
  CLASS_9: "bg-gray-400",
}

export default async function DangerousGoodsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const { dangerousGoods, byClass, total } = await getDGData(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dangerous Goods</h1>
          </div>
          <p className="text-sm text-gray-500">IMDG Code compliance — DG classification, segregation & MSDS tracking</p>
        </div>
        <Link
          href="/dangerous-goods/new"
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Register DG
        </Link>
      </div>

      {/* Compliance banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Shield className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-800">IMDG Code Compliance</p>
          <p className="text-xs text-red-600 mt-0.5">
            All DG cargo subject to +10% handling surcharge (Clauses 14, 29, 36-38) and +20% storage surcharge (Clause 32, after 24hr free).
            Explosives/DG on lighters charged at treble rates (Clause 6).
          </p>
        </div>
      </div>

      {/* IMDG class distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">IMDG Class Distribution ({total} items)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {byClass.map((cls) => (
            <div key={cls.imdgClass} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <div className={`h-3 w-3 rounded-full ${imdgColors[cls.imdgClass] ?? "bg-gray-400"}`} />
              <span className="text-xs text-gray-700 flex-1">{imdgLabels[cls.imdgClass] ?? cls.imdgClass}</span>
              <span className="text-xs font-bold text-gray-900">{cls._count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput placeholder="Search DG by UN# or name..." />
      </div>

      {/* DG registry table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">UN #</th>
              <th className="text-left p-3 font-medium text-gray-700">IMDG Class</th>
              <th className="text-left p-3 font-medium text-gray-700">Proper Shipping Name</th>
              <th className="text-left p-3 font-medium text-gray-700">Packing Group</th>
              <th className="text-left p-3 font-medium text-gray-700">Container</th>
              <th className="text-left p-3 font-medium text-gray-700">Flash Point</th>
              <th className="text-left p-3 font-medium text-gray-700">Segregation</th>
            </tr>
          </thead>
          <tbody>
            {dangerousGoods.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No dangerous goods registered.
                </td>
              </tr>
            ) : (
              dangerousGoods.map((dg) => (
                <tr key={dg.id} className="border-t border-gray-100 hover:bg-red-50/30">
                  <td className="p-3 font-mono font-bold"><Link href={`/dangerous-goods/${dg.id}`} className="text-red-700 hover:underline">{dg.unNumber}</Link></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${imdgColors[dg.imdgClass] ?? "bg-gray-400"}`} />
                      <span className="text-gray-700">{imdgLabels[dg.imdgClass]}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-900 max-w-[250px] truncate">{dg.properShippingName}</td>
                  <td className="p-3 text-gray-600">{dg.packingGroup ?? "—"}</td>
                  <td className="p-3 font-mono text-gray-600">{dg.container?.containerNumber ?? "—"}</td>
                  <td className="p-3 text-gray-600">{dg.flashPoint ?? "—"}</td>
                  <td className="p-3 text-gray-600">{dg.segregationGroup ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
