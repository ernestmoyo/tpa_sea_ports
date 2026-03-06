export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Users, Plus } from "lucide-react"
import Link from "next/link"
import { SearchInput } from "@/components/shared/search-input"

async function getCustomers(q?: string) {
  const customers = await prisma.customer.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { companyName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {},
    include: {
      _count: {
        select: { containers: true, invoices: true, cargos: true },
      },
    },
    orderBy: { name: "asc" },
  })

  const byType = await prisma.customer.groupBy({
    by: ["customerType"],
    _count: true,
  })

  const byCountry = await prisma.customer.groupBy({
    by: ["country"],
    _count: true,
  })

  return { customers, byType, byCountry }
}

const typeLabels: Record<string, string> = {
  IMPORTER: "Importer",
  EXPORTER: "Exporter",
  SHIPPING_AGENT: "Shipping Agent",
  CLEARING_AGENT: "Clearing Agent",
  SHIP_OWNER: "Ship Owner",
  TERMINAL_OPERATOR: "Terminal Operator",
  TRANSIT_CLIENT: "Transit Client",
}

const countryNames: Record<string, string> = {
  TZ: "Tanzania",
  ZM: "Zambia",
  CD: "DRC",
  BI: "Burundi",
  RW: "Rwanda",
  MW: "Malawi",
  UG: "Uganda",
  ZW: "Zimbabwe",
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const { customers, byType, byCountry } = await getCustomers(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Customer Registry</h1>
          </div>
          <p className="text-sm text-gray-500">Importers, exporters, agents & transit clients</p>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">By Type</h3>
          <div className="space-y-1">
            {byType.map((t) => (
              <div key={t.customerType} className="flex justify-between text-sm">
                <span className="text-gray-600">{typeLabels[t.customerType] ?? t.customerType}</span>
                <span className="font-medium text-gray-900">{t._count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">By Country</h3>
          <div className="space-y-1">
            {byCountry.map((c) => (
              <div key={c.country} className="flex justify-between text-sm">
                <span className="text-gray-600">{countryNames[c.country] ?? c.country}</span>
                <span className="font-medium text-gray-900">{c._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput placeholder="Search customers..." />
      </div>

      {/* Customer table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Name</th>
              <th className="text-left p-3 font-medium text-gray-700">Type</th>
              <th className="text-left p-3 font-medium text-gray-700">Country</th>
              <th className="text-left p-3 font-medium text-gray-700">Email</th>
              <th className="text-left p-3 font-medium text-gray-700">Phone</th>
              <th className="text-right p-3 font-medium text-gray-700">Containers</th>
              <th className="text-right p-3 font-medium text-gray-700">Invoices</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No customers registered yet.
                </td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr key={cust.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3">
                    <Link href={`/customers/${cust.id}`} className="font-medium text-blue-600 hover:underline">{cust.name}</Link>
                    {cust.companyName && <p className="text-xs text-gray-400">{cust.companyName}</p>}
                  </td>
                  <td className="p-3 text-gray-600">{typeLabels[cust.customerType]}</td>
                  <td className="p-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                      {cust.country}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{cust.email ?? "—"}</td>
                  <td className="p-3 text-gray-600">{cust.phone ?? "—"}</td>
                  <td className="p-3 text-right text-gray-900">{cust._count.containers}</td>
                  <td className="p-3 text-right text-gray-900">{cust._count.invoices}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
