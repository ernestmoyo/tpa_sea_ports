"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { FileText, ArrowLeft, Trash2, Clock, CheckCircle, XCircle } from "lucide-react"

interface Container {
  id: string
  containerNumber: string
  sizeType?: string
  status?: string
}
interface Cargo {
  id: string
  description: string
  cargoType?: string
}
interface Customer {
  id: string
  name: string
  code?: string
  email?: string
}

interface Document {
  id: string
  documentType: string
  documentNumber: string | null
  fileName: string
  filePath: string | null
  containerId: string | null
  cargoId: string | null
  customerId: string | null
  notes: string | null
  receivedAt: string | null
  processedAt: string | null
  container: Container | null
  cargo: Cargo | null
  customer: Customer | null
  uploadedAt: string
  createdAt: string
  updatedAt: string
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

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) return "--"
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d)
}

function computeElapsed(receivedAt: string | null, processedAt: string | null): string {
  if (!receivedAt) return "--"
  const start = new Date(receivedAt)
  const end = processedAt ? new Date(processedAt) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const totalSec = Math.floor(diffMs / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const remainMins = mins % 60
    return `${hrs}h ${remainMins}m ${secs}s`
  }
  return `${mins}m ${secs}s`
}

function metSlaTarget(receivedAt: string | null, processedAt: string | null): boolean | null {
  if (!receivedAt || !processedAt) return null
  const diffMs = new Date(processedAt).getTime() - new Date(receivedAt).getTime()
  return diffMs <= 15 * 60 * 1000
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [doc, setDoc] = useState<Document | null>(null)
  const [containers, setContainers] = useState<Container[]>([])
  const [cargoList, setCargoList] = useState<Cargo[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [form, setForm] = useState({
    documentType: "",
    documentNumber: "",
    fileName: "",
    filePath: "",
    containerId: "",
    cargoId: "",
    customerId: "",
    notes: "",
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/documents/${id}`).then((r) => r.json()),
      fetch("/api/containers").then((r) => r.json()),
      fetch("/api/cargo").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json()),
    ]).then(([docData, containerData, cargoData, customerData]) => {
      if (docData.error) {
        setError("Document not found")
        setLoading(false)
        return
      }
      setDoc(docData)
      setContainers(containerData)
      setCargoList(cargoData)
      setCustomers(customerData)
      setForm({
        documentType: docData.documentType || "BILL_OF_LADING",
        documentNumber: docData.documentNumber || "",
        fileName: docData.fileName || "",
        filePath: docData.filePath || "",
        containerId: docData.containerId || "",
        cargoId: docData.cargoId || "",
        customerId: docData.customerId || "",
        notes: docData.notes || "",
      })
      setLoading(false)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    const res = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType: form.documentType,
        documentNumber: form.documentNumber || null,
        fileName: form.fileName,
        filePath: form.filePath || null,
        containerId: form.containerId || null,
        cargoId: form.cargoId || null,
        customerId: form.customerId || null,
        notes: form.notes || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to update document")
      setSaving(false)
      return
    }

    const updated = await res.json()
    setDoc({ ...doc, ...updated } as Document)
    setSuccess("Document updated successfully")
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/documents")
    } else {
      setError("Failed to delete document")
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="max-w-2xl">
        <Link href="/documents" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">{error || "Document not found"}</div>
      </div>
    )
  }

  const slaResult = metSlaTarget(doc.receivedAt, doc.processedAt)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/documents" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{doc.documentNumber || doc.fileName}</h1>
          <span className="inline-flex text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {typeLabels[doc.documentType] ?? doc.documentType}
          </span>
        </div>
        {doc.documentNumber && (
          <p className="text-sm text-gray-500 mt-1">Document #{doc.documentNumber}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3 mb-4">{success}</div>
      )}

      {/* SLA Tracking */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">SLA Tracking (15-min target)</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Received At</span>
            <p className="font-medium text-gray-900">{formatTimestamp(doc.receivedAt)}</p>
          </div>
          <div>
            <span className="text-gray-500">Processed At</span>
            <p className="font-medium text-gray-900">{formatTimestamp(doc.processedAt)}</p>
          </div>
          <div>
            <span className="text-gray-500">Time Elapsed</span>
            <p className="font-medium text-gray-900">{computeElapsed(doc.receivedAt, doc.processedAt)}</p>
          </div>
          <div>
            <span className="text-gray-500">Met 15-min Target</span>
            {slaResult === null ? (
              <p className="font-medium text-gray-400">--</p>
            ) : slaResult ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">Yes</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-600">No</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900">Edit Document</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Name *</label>
            <input type="text" required value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="e.g. BL_MAEU2345678.pdf" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Path</label>
            <input type="text" value={form.filePath} onChange={(e) => setForm({ ...form, filePath: e.target.value })} placeholder="e.g. /uploads/documents/..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Container</label>
            <select value={form.containerId} onChange={(e) => setForm({ ...form, containerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select --</option>
              {containers.map((c) => <option key={c.id} value={c.id}>{c.containerNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <select value={form.cargoId} onChange={(e) => setForm({ ...form, cargoId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select --</option>
              {cargoList.map((c) => <option key={c.id} value={c.id}>{c.description}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select --</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/documents" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>

      {/* Linked container info */}
      {doc.container && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Linked Container</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Container #</span>
              <p className="font-mono font-medium text-gray-900">{doc.container.containerNumber}</p>
            </div>
            {doc.container.sizeType && (
              <div>
                <span className="text-gray-500">Size/Type</span>
                <p className="text-gray-900">{doc.container.sizeType}</p>
              </div>
            )}
            {doc.container.status && (
              <div>
                <span className="text-gray-500">Status</span>
                <p className="text-gray-900">{doc.container.status}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linked cargo info */}
      {doc.cargo && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Linked Cargo</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Description</span>
              <p className="font-medium text-gray-900">{doc.cargo.description}</p>
            </div>
            {doc.cargo.cargoType && (
              <div>
                <span className="text-gray-500">Cargo Type</span>
                <p className="text-gray-900">{doc.cargo.cargoType}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linked customer info */}
      {doc.customer && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Linked Customer</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name</span>
              <p className="font-medium text-gray-900">{doc.customer.name}</p>
            </div>
            {doc.customer.code && (
              <div>
                <span className="text-gray-500">Code</span>
                <p className="font-mono text-gray-900">{doc.customer.code}</p>
              </div>
            )}
            {doc.customer.email && (
              <div>
                <span className="text-gray-500">Email</span>
                <p className="text-gray-900">{doc.customer.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete section */}
      <div className="bg-white rounded-lg border border-red-200 p-5">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">Permanently delete this document. This action cannot be undone.</p>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-700 font-medium">Are you sure?</span>
            <button onClick={handleDelete} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium">
              <Trash2 className="h-4 w-4" />
              Confirm Delete
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 bg-white text-red-600 border border-red-300 px-4 py-2 rounded-md hover:bg-red-50 text-sm font-medium">
            <Trash2 className="h-4 w-4" />
            Delete Document
          </button>
        )}
      </div>
    </div>
  )
}
