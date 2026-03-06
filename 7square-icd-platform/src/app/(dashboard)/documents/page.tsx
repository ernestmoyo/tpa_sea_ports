export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { FileText, Plus, Upload } from "lucide-react"
import Link from "next/link"
import { SearchInput } from "@/components/shared/search-input"

async function getDocumentData(q?: string) {
  const documents = await prisma.document.findMany({
    where: q ? { OR: [{ fileName: { contains: q, mode: "insensitive" } }, { documentNumber: { contains: q, mode: "insensitive" } }] } : {},
    include: {
      container: true,
      cargo: true,
      customer: true,
    },
    orderBy: { uploadedAt: "desc" },
    take: 50,
  })

  const byType = await prisma.document.groupBy({
    by: ["documentType"],
    _count: true,
    orderBy: { _count: { documentType: "desc" } },
  })

  const total = await prisma.document.count()

  // SLA compliance stats
  const slaLogs = await prisma.sLALog.findMany({
    where: { serviceType: "DOCUMENT_PROCESSING" },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const slaTotal = slaLogs.length
  const slaMet = slaLogs.filter((s) => s.metTarget).length
  const slaRate = slaTotal > 0 ? Math.round((slaMet / slaTotal) * 100) : 0

  return { documents, byType, total, slaRate, slaTotal }
}

const typeLabels: Record<string, string> = {
  BILL_OF_LADING: "Bill of Lading",
  DELIVERY_ORDER: "Delivery Order",
  RELEASE_ORDER: "Release Order",
  CUSTOMS_DECLARATION: "Customs Declaration",
  MSDS: "MSDS",
  SHIPPING_ORDER: "Shipping Order",
  MANIFEST: "Manifest",
  VGM_CERTIFICATE: "VGM Certificate",
  TANCIS_ENTRY: "TANCIS Entry",
  PACKING_LIST: "Packing List",
  COMMERCIAL_INVOICE: "Commercial Invoice",
  CERTIFICATE_OF_ORIGIN: "Certificate of Origin",
  FUMIGATION_CERTIFICATE: "Fumigation Certificate",
  DG_DECLARATION: "DG Declaration",
  OTHER: "Other",
}

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const { documents, byType, total, slaRate, slaTotal } = await getDocumentData(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Documents & Compliance</h1>
          </div>
          <p className="text-sm text-gray-500">
            Trade documents — B/L, DO, RO, MSDS, VGM certificates | SLA: 15 min processing target
          </p>
        </div>
        <Link
          href="/documents/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">Total Documents</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{byType.length}</p>
          <p className="text-sm text-gray-500">Document Types</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className={`text-2xl font-bold ${slaRate >= 90 ? "text-green-600" : slaRate >= 70 ? "text-yellow-600" : "text-red-600"}`}>
            {slaRate}%
          </p>
          <p className="text-sm text-gray-500">SLA Compliance (15 min)</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{slaTotal}</p>
          <p className="text-sm text-gray-500">Processing Records</p>
        </div>
      </div>

      {/* Document types summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">By Document Type</h3>
        <div className="flex gap-2 flex-wrap">
          {byType.map((t) => (
            <span key={t.documentType} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {typeLabels[t.documentType] ?? t.documentType} ({t._count})
            </span>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput placeholder="Search documents..." />
      </div>

      {/* Document table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Type</th>
              <th className="text-left p-3 font-medium text-gray-700">Doc #</th>
              <th className="text-left p-3 font-medium text-gray-700">File</th>
              <th className="text-left p-3 font-medium text-gray-700">Container</th>
              <th className="text-left p-3 font-medium text-gray-700">Customer</th>
              <th className="text-left p-3 font-medium text-gray-700">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No documents uploaded yet.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {typeLabels[doc.documentType] ?? doc.documentType}
                    </span>
                  </td>
                  <td className="p-3 font-mono"><Link href={`/documents/${doc.id}`} className="text-blue-600 hover:underline">{doc.documentNumber ?? doc.fileName}</Link></td>
                  <td className="p-3 text-gray-900">{doc.fileName}</td>
                  <td className="p-3 font-mono text-gray-600">{doc.container?.containerNumber ?? "—"}</td>
                  <td className="p-3 text-gray-700">{doc.customer?.name ?? "—"}</td>
                  <td className="p-3 text-gray-500">{formatDate(doc.uploadedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
