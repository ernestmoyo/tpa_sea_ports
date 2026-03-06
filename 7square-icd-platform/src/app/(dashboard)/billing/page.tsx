export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Receipt, Plus } from "lucide-react"
import Link from "next/link"
import { SearchInput } from "@/components/shared/search-input"

async function getInvoices(q?: string) {
  const invoices = await prisma.invoice.findMany({
    where: q ? { OR: [{ invoiceNumber: { contains: q, mode: "insensitive" } }, { customer: { name: { contains: q, mode: "insensitive" } } }] } : {},
    include: {
      customer: true,
      lineItems: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const stats = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "DRAFT" } }),
    prisma.invoice.count({ where: { status: "ISSUED" } }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "PAID" } }),
    prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["ISSUED", "OVERDUE"] } } }),
  ])

  return {
    invoices,
    totalInvoices: stats[0],
    draftCount: stats[1],
    issuedCount: stats[2],
    paidCount: stats[3],
    overdueCount: stats[4],
    totalCollected: Number(stats[5]._sum.totalAmount ?? 0),
    totalOutstanding: Number(stats[6]._sum.totalAmount ?? 0),
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ISSUED: "bg-blue-100 text-blue-700",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  CREDITED: "bg-purple-100 text-purple-700",
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const data = await getInvoices(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Receipt className="h-6 w-6 text-yellow-600" />
            <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          </div>
          <p className="text-sm text-gray-500">Generate invoices with auto-calculated TPA tariff charges</p>
        </div>
        <Link
          href="/billing/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{data.totalInvoices}</p>
          <p className="text-sm text-gray-500">Total Invoices</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalCollected)}</p>
          <p className="text-sm text-gray-500">Total Collected</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(data.totalOutstanding)}</p>
          <p className="text-sm text-gray-500">Outstanding</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{data.overdueCount}</p>
          <p className="text-sm text-gray-500">Overdue</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-4">
        {[
          { label: "All", count: data.totalInvoices },
          { label: "Draft", count: data.draftCount },
          { label: "Issued", count: data.issuedCount },
          { label: "Paid", count: data.paidCount },
          { label: "Overdue", count: data.overdueCount },
        ].map((f) => (
          <span key={f.label} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {f.label} ({f.count})
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput placeholder="Search invoices..." />
      </div>

      {/* Invoice table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Invoice #</th>
              <th className="text-left p-3 font-medium text-gray-700">Customer</th>
              <th className="text-left p-3 font-medium text-gray-700">Date</th>
              <th className="text-right p-3 font-medium text-gray-700">Amount</th>
              <th className="text-left p-3 font-medium text-gray-700">Status</th>
              <th className="text-right p-3 font-medium text-gray-700">Line Items</th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No invoices yet. Click &quot;New Invoice&quot; to create one.
                </td>
              </tr>
            ) : (
              data.invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3 font-mono font-medium"><Link href={`/billing/${inv.id}`} className="text-blue-600 hover:underline">{inv.invoiceNumber}</Link></td>
                  <td className="p-3 text-gray-700">{inv.customer.name}</td>
                  <td className="p-3 text-gray-600">{inv.issuedDate ? formatDate(inv.issuedDate) : "—"}</td>
                  <td className="p-3 text-right font-semibold text-gray-900">
                    {formatCurrency(Number(inv.totalAmount))}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-gray-500">{inv.lineItems.length}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
