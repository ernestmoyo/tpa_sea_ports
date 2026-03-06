export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Container as ContainerIcon, Plus } from "lucide-react"
import Link from "next/link"
import { SearchInput } from "@/components/shared/search-input"

async function getContainers(q?: string) {
  const containers = await prisma.container.findMany({
    where: q ? { containerNumber: { contains: q, mode: "insensitive" } } : {},
    include: {
      customer: true,
      vesselCall: { include: { vessel: true } },
      dangerousGoods: true,
      storageBookings: { where: { status: "ACTIVE" } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const stats = await Promise.all([
    prisma.container.count(),
    prisma.container.count({ where: { status: "IN_STORAGE" } }),
    prisma.container.count({ where: { containerType: "REEFER" } }),
    prisma.container.count({ where: { isOverDimension: true } }),
    prisma.container.count({ where: { vgmCertified: true } }),
    prisma.container.count({ where: { dangerousGoods: { some: {} } } }),
  ])

  return {
    containers,
    total: stats[0],
    inStorage: stats[1],
    reefers: stats[2],
    overDimension: stats[3],
    vgmCertified: stats[4],
    dgContainers: stats[5],
  }
}

const statusColors: Record<string, string> = {
  ARRIVING: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-yellow-100 text-yellow-700",
  IN_STORAGE: "bg-green-100 text-green-700",
  UNDER_OPERATION: "bg-orange-100 text-orange-700",
  READY_FOR_RELEASE: "bg-purple-100 text-purple-700",
  RELEASED: "bg-gray-100 text-gray-700",
  DEPARTED: "bg-gray-100 text-gray-500",
}

const sizeLabels: Record<string, string> = {
  SIZE_20: "20ft",
  SIZE_40: "40ft",
  SIZE_45: "45ft",
}

export default async function ContainersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const data = await getContainers(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ContainerIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Container Registry</h1>
          </div>
          <p className="text-sm text-gray-500">ISO 6346 container tracking with VGM & IMDG compliance</p>
        </div>
        <Link
          href="/containers/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Register Container
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Total", value: data.total, color: "text-gray-900" },
          { label: "In Storage", value: data.inStorage, color: "text-green-600" },
          { label: "Reefer", value: data.reefers, color: "text-cyan-600" },
          { label: "Over-dimension", value: data.overDimension, color: "text-orange-600" },
          { label: "VGM Certified", value: data.vgmCertified, color: "text-blue-600" },
          { label: "Dangerous Goods", value: data.dgContainers, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-3">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput placeholder="Search containers..." />
      </div>

      {/* Container table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Container #</th>
              <th className="text-left p-3 font-medium text-gray-700">Size</th>
              <th className="text-left p-3 font-medium text-gray-700">Type</th>
              <th className="text-left p-3 font-medium text-gray-700">Status</th>
              <th className="text-left p-3 font-medium text-gray-700">Customer</th>
              <th className="text-left p-3 font-medium text-gray-700">Vessel</th>
              <th className="text-center p-3 font-medium text-gray-700">FCL</th>
              <th className="text-center p-3 font-medium text-gray-700">VGM</th>
              <th className="text-center p-3 font-medium text-gray-700">DG</th>
            </tr>
          </thead>
          <tbody>
            {data.containers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  No containers registered. Click &quot;Register Container&quot; to add one.
                </td>
              </tr>
            ) : (
              data.containers.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3 font-mono font-medium">
                    <Link href={`/containers/${c.id}`} className="text-blue-600 hover:underline">{c.containerNumber}</Link>
                  </td>
                  <td className="p-3 text-gray-600">{sizeLabels[c.size]}</td>
                  <td className="p-3 text-gray-600">{c.containerType}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">{c.customer?.name ?? "—"}</td>
                  <td className="p-3 text-gray-600 text-xs">{c.vesselCall?.vessel?.name ?? "—"}</td>
                  <td className="p-3 text-center">{c.isFcl ? "Y" : "N"}</td>
                  <td className="p-3 text-center">
                    {c.vgmCertified ? (
                      <span className="text-green-600 font-bold">V</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {c.dangerousGoods.length > 0 ? (
                      <span className="text-red-600 font-bold">DG</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
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
