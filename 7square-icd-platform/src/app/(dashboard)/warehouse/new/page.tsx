"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Warehouse, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewWarehousePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    warehouseType: "BONDED",
    location: "",
    totalCapacityTeu: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/warehouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        totalCapacityTeu: parseInt(form.totalCapacityTeu),
        location: form.location || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to create warehouse")
      setLoading(false)
      return
    }

    router.push("/warehouse")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/warehouse" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Warehouses
        </Link>
        <div className="flex items-center gap-3">
          <Warehouse className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Add Warehouse</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Name *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select value={form.warehouseType} onChange={(e) => setForm({ ...form, warehouseType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="BONDED">Bonded</option>
              <option value="FREE">Free</option>
              <option value="REEFER_YARD">Reefer Yard</option>
              <option value="DG_ZONE">DG Zone</option>
              <option value="OPEN_YARD">Open Yard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity (TEU) *</label>
            <input type="number" required value={form.totalCapacityTeu} onChange={(e) => setForm({ ...form, totalCapacityTeu: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Block A, Zone 3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {loading ? "Adding..." : "Add Warehouse"}
          </button>
          <Link href="/warehouse" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
