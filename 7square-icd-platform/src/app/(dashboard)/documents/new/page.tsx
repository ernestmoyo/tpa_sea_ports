"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Customer { id: string; name: string }
interface Container { id: string; containerNumber: string }

export default function NewDocumentPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    documentType: "BILL_OF_LADING",
    documentNumber: "",
    fileName: "",
    containerId: "",
    customerId: "",
    notes: "",
  })

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers)
    fetch("/api/containers").then((r) => r.json()).then(setContainers)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType: form.documentType,
        documentNumber: form.documentNumber || null,
        fileName: form.fileName,
        containerId: form.containerId || null,
        customerId: form.customerId || null,
        notes: form.notes || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to upload document")
      setLoading(false)
      return
    }

    router.push("/documents")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/documents" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">SLA target: 15 minutes processing time per TPA Charter</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
            <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="BILL_OF_LADING">Bill of Lading</option>
              <option value="DELIVERY_ORDER">Delivery Order</option>
              <option value="RELEASE_ORDER">Release Order</option>
              <option value="CUSTOMS_DECLARATION">Customs Declaration</option>
              <option value="MSDS">MSDS</option>
              <option value="SHIPPING_ORDER">Shipping Order</option>
              <option value="MANIFEST">Manifest</option>
              <option value="VGM_CERTIFICATE">VGM Certificate</option>
              <option value="TANCIS_ENTRY">TANCIS Entry</option>
              <option value="PACKING_LIST">Packing List</option>
              <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
              <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin</option>
              <option value="FUMIGATION_CERTIFICATE">Fumigation Certificate</option>
              <option value="DG_DECLARATION">DG Declaration</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
            <input type="text" value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} placeholder="e.g. BL-2024-0891" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">File Name *</label>
            <input type="text" required value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="e.g. BL_MAEU2345678.pdf" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Container</label>
            <select value={form.containerId} onChange={(e) => setForm({ ...form, containerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select —</option>
              {containers.map((c) => <option key={c.id} value={c.id}>{c.containerNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {loading ? "Uploading..." : "Upload Document"}
          </button>
          <Link href="/documents" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
