"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Ship, ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react"

const vesselTypeLabels: Record<string, string> = {
  CONTAINER_SHIP: "Container Ship",
  BULK_CARRIER: "Bulk Carrier",
  TANKER: "Tanker",
  GENERAL_CARGO: "General Cargo",
  RORO: "RORO",
  PASSENGER: "Passenger",
  TUG: "Tug",
  BARGE: "Barge",
  DHOW: "Dhow",
  FISHING: "Fishing",
  COASTER: "Coaster",
  TRADITIONAL: "Traditional",
  PLEASURE_CRAFT: "Pleasure Craft",
  OTHER: "Other",
}

const callStatusColors: Record<string, string> = {
  EXPECTED: "bg-yellow-100 text-yellow-800",
  ARRIVED: "bg-blue-100 text-blue-800",
  BERTHED: "bg-indigo-100 text-indigo-800",
  WORKING: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  DEPARTED: "bg-gray-100 text-gray-600",
}

interface VesselCall {
  id: string
  voyageNumber: string | null
  eta: string | null
  ata: string | null
  atd: string | null
  berth: string | null
  status: string
}

interface Vessel {
  id: string
  name: string
  imoNumber: string | null
  grt: number | string
  dwt: number | string | null
  loa: number | string | null
  beam?: number | string | null
  draft?: number | string | null
  vesselType: string
  flagState: string | null
  isCoaster: boolean
  createdAt: string
  updatedAt: string
  vesselCalls: VesselCall[]
}

function formatDate(date: string | null) {
  if (!date) return "--"
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(date: string | null) {
  if (!date) return "--"
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function VesselDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [vessel, setVessel] = useState<Vessel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [form, setForm] = useState({
    name: "",
    imoNumber: "",
    grt: "",
    dwt: "",
    loa: "",
    beam: "",
    draft: "",
    flagState: "",
    vesselType: "CONTAINER_SHIP",
    isCoaster: false,
  })

  useEffect(() => {
    fetch(`/api/vessels/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Vessel not found")
        return r.json()
      })
      .then((data: Vessel) => {
        setVessel(data)
        setForm({
          name: data.name,
          imoNumber: data.imoNumber ?? "",
          grt: String(data.grt ?? ""),
          dwt: String(data.dwt ?? ""),
          loa: String(data.loa ?? ""),
          beam: String(data.beam ?? ""),
          draft: String(data.draft ?? ""),
          flagState: data.flagState ?? "",
          vesselType: data.vesselType,
          isCoaster: data.isCoaster,
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

    const res = await fetch(`/api/vessels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        imoNumber: form.imoNumber || null,
        grt: form.grt ? parseFloat(form.grt) : undefined,
        dwt: form.dwt ? parseFloat(form.dwt) : null,
        loa: form.loa ? parseFloat(form.loa) : null,
        beam: form.beam ? parseFloat(form.beam) : null,
        draft: form.draft ? parseFloat(form.draft) : null,
        flagState: form.flagState || null,
        vesselType: form.vesselType,
        isCoaster: form.isCoaster,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to update vessel")
      setSaving(false)
      return
    }

    const updated = await res.json()
    setVessel((prev) => (prev ? { ...prev, ...updated } : prev))
    setEditing(false)
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/vessels/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/vessels")
    } else {
      const data = await res.json()
      setError(data.message || "Failed to delete vessel")
      setDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading vessel...</div>
      </div>
    )
  }

  if (!vessel) {
    return (
      <div>
        <Link href="/vessels" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Vessels
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-4">
          {error || "Vessel not found"}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/vessels" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Vessels
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ship className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vessel.name}</h1>
              {vessel.imoNumber && (
                <p className="text-sm text-gray-500">IMO {vessel.imoNumber}</p>
              )}
            </div>
            <span className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {vesselTypeLabels[vessel.vesselType] ?? vessel.vesselType}
            </span>
            {vessel.isCoaster && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coaster
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IMO Number</label>
                <input
                  type="text"
                  value={form.imoNumber}
                  onChange={(e) => setForm({ ...form, imoNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Type *</label>
                <select
                  value={form.vesselType}
                  onChange={(e) => setForm({ ...form, vesselType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CONTAINER_SHIP">Container Ship</option>
                  <option value="BULK_CARRIER">Bulk Carrier</option>
                  <option value="TANKER">Tanker</option>
                  <option value="GENERAL_CARGO">General Cargo</option>
                  <option value="RORO">RORO</option>
                  <option value="PASSENGER">Passenger</option>
                  <option value="TUG">Tug</option>
                  <option value="BARGE">Barge</option>
                  <option value="DHOW">Dhow</option>
                  <option value="FISHING">Fishing</option>
                  <option value="COASTER">Coaster</option>
                  <option value="TRADITIONAL">Traditional</option>
                  <option value="PLEASURE_CRAFT">Pleasure Craft</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GRT (Gross Registered Tonnage) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={form.grt}
                  onChange={(e) => setForm({ ...form, grt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DWT (Deadweight Tonnage)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.dwt}
                  onChange={(e) => setForm({ ...form, dwt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LOA (metres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.loa}
                  onChange={(e) => setForm({ ...form, loa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beam (metres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.beam}
                  onChange={(e) => setForm({ ...form, beam: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Draft (metres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.draft}
                  onChange={(e) => setForm({ ...form, draft: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag State</label>
                <input
                  type="text"
                  value={form.flagState}
                  onChange={(e) => setForm({ ...form, flagState: e.target.value })}
                  placeholder="e.g. Panama, Liberia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isCoaster}
                onChange={(e) => setForm({ ...form, isCoaster: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Coaster vessel (reduced tariff rates apply)</span>
            </label>

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
                    name: vessel.name,
                    imoNumber: vessel.imoNumber ?? "",
                    grt: String(vessel.grt ?? ""),
                    dwt: String(vessel.dwt ?? ""),
                    loa: String(vessel.loa ?? ""),
                    beam: String(vessel.beam ?? ""),
                    draft: String(vessel.draft ?? ""),
                    flagState: vessel.flagState ?? "",
                    vesselType: vessel.vesselType,
                    isCoaster: vessel.isCoaster,
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Vessel Type</span>
              <p className="font-medium text-gray-900">{vesselTypeLabels[vessel.vesselType]}</p>
            </div>
            <div>
              <span className="text-gray-500">IMO Number</span>
              <p className="font-medium text-gray-900">{vessel.imoNumber ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">GRT</span>
              <p className="font-medium text-gray-900">{Number(vessel.grt).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">DWT</span>
              <p className="font-medium text-gray-900">{vessel.dwt ? Number(vessel.dwt).toLocaleString() : "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">LOA</span>
              <p className="font-medium text-gray-900">{vessel.loa ? `${Number(vessel.loa)} m` : "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Beam</span>
              <p className="font-medium text-gray-900">{vessel.beam ? `${Number(vessel.beam)} m` : "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Draft</span>
              <p className="font-medium text-gray-900">{vessel.draft ? `${Number(vessel.draft)} m` : "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Flag State</span>
              <p className="font-medium text-gray-900">{vessel.flagState ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Coaster</span>
              <p className="font-medium text-gray-900">{vessel.isCoaster ? "Yes" : "No"}</p>
            </div>
            <div>
              <span className="text-gray-500">Registered</span>
              <p className="font-medium text-gray-900">{formatDate(vessel.createdAt)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Vessel Calls */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Vessel Calls ({vessel.vesselCalls?.length ?? 0})</h2>
        </div>
        {vessel.vesselCalls && vessel.vesselCalls.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Voyage</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
                <th className="text-left p-3 font-medium text-gray-700">Berth</th>
                <th className="text-left p-3 font-medium text-gray-700">ETA</th>
                <th className="text-left p-3 font-medium text-gray-700">ETD</th>
              </tr>
            </thead>
            <tbody>
              {vessel.vesselCalls.map((call) => (
                <tr key={call.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3 font-medium text-gray-900">{call.voyageNumber ?? "--"}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${callStatusColors[call.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{call.berth ?? "--"}</td>
                  <td className="p-3 text-gray-600">{formatDateTime(call.eta)}</td>
                  <td className="p-3 text-gray-600">{formatDateTime(call.atd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">No vessel calls recorded.</div>
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
            Delete Vessel
          </button>
        )}
      </div>
    </div>
  )
}
