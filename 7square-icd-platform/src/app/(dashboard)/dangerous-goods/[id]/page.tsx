"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, Shield, Trash2 } from "lucide-react"

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

interface DangerousGood {
  id: string
  imdgClass: string
  unNumber: string
  properShippingName: string
  packingGroup: string | null
  flashPoint: string | null
  segregationGroup: string | null
  emergencySchedule: string | null
  containerId: string | null
  cargoId: string | null
  notes: string | null
  container: Container | null
  cargo: Cargo | null
  createdAt: string
  updatedAt: string
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

export default function DangerousGoodDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [dg, setDg] = useState<DangerousGood | null>(null)
  const [containers, setContainers] = useState<Container[]>([])
  const [cargoList, setCargoList] = useState<Cargo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [form, setForm] = useState({
    imdgClass: "",
    unNumber: "",
    properShippingName: "",
    packingGroup: "",
    flashPoint: "",
    segregationGroup: "",
    emergencySchedule: "",
    containerId: "",
    cargoId: "",
    notes: "",
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/dangerous-goods/${id}`).then((r) => r.json()),
      fetch("/api/containers").then((r) => r.json()),
      fetch("/api/cargo").then((r) => r.json()),
    ]).then(([dgData, containerData, cargoData]) => {
      if (dgData.error) {
        setError("Dangerous goods record not found")
        setLoading(false)
        return
      }
      setDg(dgData)
      setContainers(containerData)
      setCargoList(cargoData)
      setForm({
        imdgClass: dgData.imdgClass || "CLASS_3",
        unNumber: dgData.unNumber || "",
        properShippingName: dgData.properShippingName || "",
        packingGroup: dgData.packingGroup || "",
        flashPoint: dgData.flashPoint || "",
        segregationGroup: dgData.segregationGroup || "",
        emergencySchedule: dgData.emergencySchedule || "",
        containerId: dgData.containerId || "",
        cargoId: dgData.cargoId || "",
        notes: dgData.notes || "",
      })
      setLoading(false)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    const res = await fetch(`/api/dangerous-goods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imdgClass: form.imdgClass,
        unNumber: form.unNumber,
        properShippingName: form.properShippingName,
        packingGroup: form.packingGroup || null,
        flashPoint: form.flashPoint || null,
        segregationGroup: form.segregationGroup || null,
        emergencySchedule: form.emergencySchedule || null,
        containerId: form.containerId || null,
        cargoId: form.cargoId || null,
        notes: form.notes || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to update dangerous goods")
      setSaving(false)
      return
    }

    const updated = await res.json()
    setDg({ ...dg, ...updated } as DangerousGood)
    setSuccess("Dangerous goods updated successfully")
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/dangerous-goods/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/dangerous-goods")
    } else {
      setError("Failed to delete dangerous goods record")
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

  if (!dg) {
    return (
      <div className="max-w-2xl">
        <Link href="/dangerous-goods" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Dangerous Goods
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">{error || "Record not found"}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dangerous-goods" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Dangerous Goods
        </Link>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="font-mono text-red-700">{dg.unNumber}</span>
          </h1>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1 rounded-full ${imdgColors[dg.imdgClass] ?? "bg-gray-400"}`}>
            {imdgLabels[dg.imdgClass] ?? dg.imdgClass}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{dg.properShippingName}</p>
      </div>

      {/* IMDG compliance banner */}
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3 mb-4">{success}</div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900">Edit Dangerous Goods</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UN Number *</label>
            <input
              type="text"
              required
              pattern="UN\d{4}"
              title="Format: UN followed by 4 digits (e.g. UN1203)"
              value={form.unNumber}
              onChange={(e) => setForm({ ...form, unNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. UN1203"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IMDG Class *</label>
            <select value={form.imdgClass} onChange={(e) => setForm({ ...form, imdgClass: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="CLASS_1">1 - Explosives</option>
              <option value="CLASS_2_1">2.1 - Flammable Gases</option>
              <option value="CLASS_2_2">2.2 - Non-Flammable Gases</option>
              <option value="CLASS_2_3">2.3 - Toxic Gases</option>
              <option value="CLASS_3">3 - Flammable Liquids</option>
              <option value="CLASS_4_1">4.1 - Flammable Solids</option>
              <option value="CLASS_4_2">4.2 - Spontaneously Combustible</option>
              <option value="CLASS_4_3">4.3 - Dangerous When Wet</option>
              <option value="CLASS_5_1">5.1 - Oxidizing Substances</option>
              <option value="CLASS_5_2">5.2 - Organic Peroxides</option>
              <option value="CLASS_6_1">6.1 - Toxic Substances</option>
              <option value="CLASS_6_2">6.2 - Infectious Substances</option>
              <option value="CLASS_7">7 - Radioactive Material</option>
              <option value="CLASS_8">8 - Corrosives</option>
              <option value="CLASS_9">9 - Miscellaneous</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Proper Shipping Name *</label>
            <input type="text" required value={form.properShippingName} onChange={(e) => setForm({ ...form, properShippingName: e.target.value })} placeholder="e.g. METHANOL" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Packing Group</label>
            <select value={form.packingGroup} onChange={(e) => setForm({ ...form, packingGroup: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- None --</option>
              <option value="I">I - Great Danger</option>
              <option value="II">II - Medium Danger</option>
              <option value="III">III - Minor Danger</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flash Point</label>
            <input type="text" value={form.flashPoint} onChange={(e) => setForm({ ...form, flashPoint: e.target.value })} placeholder="e.g. 11C" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segregation Group</label>
            <input type="text" value={form.segregationGroup} onChange={(e) => setForm({ ...form, segregationGroup: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Schedule</label>
            <input type="text" value={form.emergencySchedule} onChange={(e) => setForm({ ...form, emergencySchedule: e.target.value })} placeholder="e.g. F-E, S-D" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="submit" disabled={saving} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/dangerous-goods" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>

      {/* Linked container info */}
      {dg.container && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Linked Container</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Container #</span>
              <p className="font-mono font-medium text-gray-900">{dg.container.containerNumber}</p>
            </div>
            {dg.container.sizeType && (
              <div>
                <span className="text-gray-500">Size/Type</span>
                <p className="text-gray-900">{dg.container.sizeType}</p>
              </div>
            )}
            {dg.container.status && (
              <div>
                <span className="text-gray-500">Status</span>
                <p className="text-gray-900">{dg.container.status}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linked cargo info */}
      {dg.cargo && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Linked Cargo</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Description</span>
              <p className="font-medium text-gray-900">{dg.cargo.description}</p>
            </div>
            {dg.cargo.cargoType && (
              <div>
                <span className="text-gray-500">Cargo Type</span>
                <p className="text-gray-900">{dg.cargo.cargoType}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete section */}
      <div className="bg-white rounded-lg border border-red-200 p-5">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">Permanently delete this dangerous goods record. This action cannot be undone.</p>
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
            Delete Record
          </button>
        )}
      </div>
    </div>
  )
}
