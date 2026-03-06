"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Ship, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewVesselPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    imoNumber: "",
    grt: "",
    dwt: "",
    loa: "",
    vesselType: "CONTAINER_SHIP",
    flagState: "",
    isCoaster: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/vessels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        grt: parseInt(form.grt),
        dwt: form.dwt ? parseFloat(form.dwt) : null,
        loa: form.loa ? parseFloat(form.loa) : null,
        imoNumber: form.imoNumber || null,
        flagState: form.flagState || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to create vessel")
      setLoading(false)
      return
    }

    router.push("/vessels")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/vessels" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Vessels
        </Link>
        <div className="flex items-center gap-3">
          <Ship className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Register Vessel</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">GRT is used for pilotage, port dues and tug charge calculations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="MSC FLAMINIA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IMO Number</label>
            <input
              type="text"
              value={form.imoNumber}
              onChange={(e) => setForm({ ...form, imoNumber: e.target.value })}
              placeholder="9225898"
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
              <option value="RORO">RORO</option>
              <option value="GENERAL_CARGO">General Cargo</option>
              <option value="DHOW">Dhow</option>
              <option value="COASTER">Coaster</option>
              <option value="TRADITIONAL">Traditional</option>
              <option value="PLEASURE_CRAFT">Pleasure Craft</option>
              <option value="TUG">Tug</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GRT (Gross Registered Tonnage) *</label>
            <input
              type="number"
              step="1"
              min="1"
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
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? "Registering..." : "Register Vessel"}
          </button>
          <Link href="/vessels" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
