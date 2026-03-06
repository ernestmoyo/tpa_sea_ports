"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Package, ArrowLeft, Pencil, Trash2, Save, X, AlertTriangle, Snowflake, Gem } from "lucide-react"

const cargoTypeLabels: Record<string, string> = {
  DOMESTIC_IMPORT: "Domestic Import",
  DOMESTIC_EXPORT: "Domestic Export",
  TRANSIT_IMPORT: "Transit Import",
  TRANSIT_EXPORT: "Transit Export",
  TRANSSHIPMENT: "Transshipment",
  COASTWISE: "Coastwise",
}

const cargoTypeBadgeColors: Record<string, string> = {
  DOMESTIC_IMPORT: "bg-blue-100 text-blue-800",
  DOMESTIC_EXPORT: "bg-green-100 text-green-800",
  TRANSIT_IMPORT: "bg-purple-100 text-purple-800",
  TRANSIT_EXPORT: "bg-indigo-100 text-indigo-800",
  TRANSSHIPMENT: "bg-orange-100 text-orange-800",
  COASTWISE: "bg-teal-100 text-teal-800",
}

interface Customer {
  id: string
  name: string
}

interface ContainerCargo {
  id: string
  container: {
    id: string
    containerNumber: string
    size: string
    containerType: string
    status: string
  }
}

interface DGRecord {
  id: string
  imdgClass: string
  unNumber: string
  properShippingName: string
  packingGroup: string | null
}

interface Document {
  id: string
  documentType: string
  documentNumber: string | null
  fileName: string
  uploadedAt: string
}

interface Cargo {
  id: string
  description: string
  hsCode: string | null
  weightKg: number | string
  volumeCbm: number | string | null
  harbourTonnes: number | string
  cifValueUsd: number | string | null
  cargoType: string
  isDangerous: boolean
  isColdStorage: boolean
  isValuable: boolean
  packageCount: number | null
  destinationCountry: string | null
  customerId: string | null
  customer: Customer | null
  createdAt: string
  updatedAt: string
  containers: ContainerCargo[]
  dangerousGoods: DGRecord[]
  documents: Document[]
}

function formatDate(date: string | null) {
  if (!date) return "--"
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount))
}

const containerSizeLabels: Record<string, string> = {
  SIZE_20: "20ft",
  SIZE_40: "40ft",
  SIZE_45: "45ft",
}

const containerStatusColors: Record<string, string> = {
  ARRIVING: "bg-yellow-100 text-yellow-800",
  RECEIVED: "bg-blue-100 text-blue-800",
  IN_STORAGE: "bg-purple-100 text-purple-800",
  UNDER_OPERATION: "bg-orange-100 text-orange-800",
  READY_FOR_RELEASE: "bg-green-100 text-green-800",
  RELEASED: "bg-gray-100 text-gray-800",
  DEPARTED: "bg-gray-100 text-gray-600",
}

export default function CargoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cargo, setCargo] = useState<Cargo | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [form, setForm] = useState({
    description: "",
    hsCode: "",
    weightKg: "",
    volumeCbm: "",
    cifValueUsd: "",
    cargoType: "DOMESTIC_IMPORT",
    isDangerous: false,
    isColdStorage: false,
    isValuable: false,
    customerId: "",
  })

  const harbourTonnes = Math.max(
    parseFloat(form.weightKg || "0") / 1000,
    parseFloat(form.volumeCbm || "0")
  )

  useEffect(() => {
    Promise.all([
      fetch(`/api/cargo/${id}`).then((r) => {
        if (!r.ok) throw new Error("Cargo not found")
        return r.json()
      }),
      fetch("/api/customers").then((r) => r.json()),
    ])
      .then(([cargoData, customerData]: [Cargo, Customer[]]) => {
        setCargo(cargoData)
        setCustomers(customerData)
        setForm({
          description: cargoData.description,
          hsCode: cargoData.hsCode ?? "",
          weightKg: String(cargoData.weightKg ?? ""),
          volumeCbm: String(cargoData.volumeCbm ?? ""),
          cifValueUsd: String(cargoData.cifValueUsd ?? ""),
          cargoType: cargoData.cargoType,
          isDangerous: cargoData.isDangerous,
          isColdStorage: cargoData.isColdStorage,
          isValuable: cargoData.isValuable,
          customerId: cargoData.customerId ?? "",
        })
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError("")

    const weightKg = parseFloat(form.weightKg)
    const volumeCbm = form.volumeCbm ? parseFloat(form.volumeCbm) : null
    const computedHT = Math.max(weightKg / 1000, volumeCbm ?? 0)

    const res = await fetch(`/api/cargo/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        hsCode: form.hsCode || null,
        weightKg,
        volumeCbm,
        harbourTonnes: computedHT,
        cifValueUsd: form.cifValueUsd ? parseFloat(form.cifValueUsd) : null,
        cargoType: form.cargoType,
        isDangerous: form.isDangerous,
        isColdStorage: form.isColdStorage,
        isValuable: form.isValuable,
        customerId: form.customerId || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to update cargo")
      setSaving(false)
      return
    }

    const updated = await res.json()
    setCargo((prev) => (prev ? { ...prev, ...updated } : prev))
    setEditing(false)
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/cargo/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/cargo")
    } else {
      const data = await res.json()
      setError(data.message || "Failed to delete cargo")
      setDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading cargo...</div>
      </div>
    )
  }

  if (!cargo) {
    return (
      <div>
        <Link href="/cargo" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Cargo
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-4">
          {error || "Cargo not found"}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/cargo" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Cargo
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cargo.description}</h1>
              {cargo.customer && (
                <p className="text-sm text-gray-500">
                  Customer:{" "}
                  <Link href={`/customers/${cargo.customer.id}`} className="text-blue-600 hover:underline">
                    {cargo.customer.name}
                  </Link>
                </p>
              )}
            </div>
            <span className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${cargoTypeBadgeColors[cargo.cargoType] ?? "bg-gray-100 text-gray-700"}`}>
              {cargoTypeLabels[cargo.cargoType] ?? cargo.cargoType}
            </span>
            {cargo.isDangerous && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3" /> DG
              </span>
            )}
            {cargo.isColdStorage && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                <Snowflake className="h-3 w-3" /> Cold
              </span>
            )}
            {cargo.isValuable && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <Gem className="h-3 w-3" /> Valuable
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      {/* Edit Form / Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {editing ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type *</label>
                <select
                  value={form.cargoType}
                  onChange={(e) => setForm({ ...form, cargoType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DOMESTIC_IMPORT">Domestic Import</option>
                  <option value="DOMESTIC_EXPORT">Domestic Export</option>
                  <option value="TRANSIT_IMPORT">Transit Import</option>
                  <option value="TRANSIT_EXPORT">Transit Export</option>
                  <option value="TRANSSHIPMENT">Transshipment</option>
                  <option value="COASTWISE">Coastwise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
                <input
                  type="text"
                  value={form.hsCode}
                  onChange={(e) => setForm({ ...form, hsCode: e.target.value })}
                  placeholder="e.g. 8528.72"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume (CBM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.volumeCbm}
                  onChange={(e) => setForm({ ...form, volumeCbm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Live harbour tonne calc */}
              <div className="col-span-2 bg-blue-50 rounded-lg p-3">
                <span className="text-sm text-blue-700 font-medium">
                  Harbour Tonnes (auto): {harbourTonnes.toFixed(2)} HTN
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CIF Value (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cifValueUsd}
                  onChange={(e) => setForm({ ...form, cifValueUsd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isDangerous}
                  onChange={(e) => setForm({ ...form, isDangerous: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Dangerous Goods (+10%/+20%)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isColdStorage}
                  onChange={(e) => setForm({ ...form, isColdStorage: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Cold Storage (+30%)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isValuable}
                  onChange={(e) => setForm({ ...form, isValuable: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Valuable Cargo</span>
              </label>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setForm({
                    description: cargo.description,
                    hsCode: cargo.hsCode ?? "",
                    weightKg: String(cargo.weightKg ?? ""),
                    volumeCbm: String(cargo.volumeCbm ?? ""),
                    cifValueUsd: String(cargo.cifValueUsd ?? ""),
                    cargoType: cargo.cargoType,
                    isDangerous: cargo.isDangerous,
                    isColdStorage: cargo.isColdStorage,
                    isValuable: cargo.isValuable,
                    customerId: cargo.customerId ?? "",
                  })
                }}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Cargo Type</span>
              <p className="font-medium text-gray-900">{cargoTypeLabels[cargo.cargoType]}</p>
            </div>
            <div>
              <span className="text-gray-500">HS Code</span>
              <p className="font-medium text-gray-900">{cargo.hsCode ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Weight</span>
              <p className="font-medium text-gray-900">{Number(cargo.weightKg).toLocaleString()} kg</p>
            </div>
            <div>
              <span className="text-gray-500">Volume</span>
              <p className="font-medium text-gray-900">{cargo.volumeCbm ? `${Number(cargo.volumeCbm)} CBM` : "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Harbour Tonnes</span>
              <p className="font-medium text-gray-900">{Number(cargo.harbourTonnes).toFixed(2)} HTN</p>
            </div>
            <div>
              <span className="text-gray-500">CIF Value</span>
              <p className="font-medium text-gray-900">{cargo.cifValueUsd ? formatCurrency(cargo.cifValueUsd) : "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Customer</span>
              <p className="font-medium text-gray-900">
                {cargo.customer ? (
                  <Link href={`/customers/${cargo.customer.id}`} className="text-blue-600 hover:underline">
                    {cargo.customer.name}
                  </Link>
                ) : "--"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Packages</span>
              <p className="font-medium text-gray-900">{cargo.packageCount ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Registered</span>
              <p className="font-medium text-gray-900">{formatDate(cargo.createdAt)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Linked Containers */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Linked Containers ({cargo.containers?.length ?? 0})</h2>
        </div>
        {cargo.containers && cargo.containers.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Number</th>
                <th className="text-left p-3 font-medium text-gray-700">Size</th>
                <th className="text-left p-3 font-medium text-gray-700">Type</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {cargo.containers.map((cc) => (
                <tr key={cc.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3">
                    <Link href={`/containers/${cc.container.id}`} className="text-blue-600 hover:underline font-medium">
                      {cc.container.containerNumber}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{containerSizeLabels[cc.container.size] ?? cc.container.size}</td>
                  <td className="p-3 text-gray-600">{cc.container.containerType}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${containerStatusColors[cc.container.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {cc.container.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">No containers linked to this cargo.</div>
        )}
      </div>

      {/* DG Records */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Dangerous Goods Records ({cargo.dangerousGoods?.length ?? 0})</h2>
        </div>
        {cargo.dangerousGoods && cargo.dangerousGoods.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">IMDG Class</th>
                <th className="text-left p-3 font-medium text-gray-700">UN Number</th>
                <th className="text-left p-3 font-medium text-gray-700">Proper Shipping Name</th>
                <th className="text-left p-3 font-medium text-gray-700">Packing Group</th>
              </tr>
            </thead>
            <tbody>
              {cargo.dangerousGoods.map((dg) => (
                <tr key={dg.id} className="border-t border-gray-100 hover:bg-red-50/30">
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-red-100 text-red-800">
                      {dg.imdgClass.replace(/_/g, ".")}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-gray-900">{dg.unNumber}</td>
                  <td className="p-3 text-gray-600">{dg.properShippingName}</td>
                  <td className="p-3 text-gray-600">{dg.packingGroup ?? "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">No dangerous goods records.</div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Documents ({cargo.documents?.length ?? 0})</h2>
        </div>
        {cargo.documents && cargo.documents.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Type</th>
                <th className="text-left p-3 font-medium text-gray-700">Document #</th>
                <th className="text-left p-3 font-medium text-gray-700">File Name</th>
                <th className="text-left p-3 font-medium text-gray-700">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {cargo.documents.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-700">
                      {doc.documentType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{doc.documentNumber ?? "--"}</td>
                  <td className="p-3 font-medium text-gray-900">{doc.fileName}</td>
                  <td className="p-3 text-gray-600">{formatDate(doc.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">No documents attached.</div>
        )}
      </div>

      {/* Delete */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h3 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h3>
        {deleteConfirm ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-red-600">Are you sure? This action cannot be undone.</p>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Confirm Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 border border-red-300 text-red-700 px-4 py-2 rounded-md hover:bg-red-50 text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Delete Cargo
          </button>
        )}
      </div>
    </div>
  )
}
