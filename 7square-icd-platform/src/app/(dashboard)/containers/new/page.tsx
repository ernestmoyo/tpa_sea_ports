"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container as ContainerIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  name: string
}

interface VesselCall {
  id: string
  vessel: { name: string }
  voyageNumber: string | null
  status: string
}

export default function NewContainerPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vesselCalls, setVesselCalls] = useState<VesselCall[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    containerNumber: "",
    size: "SIZE_20",
    containerType: "DRY",
    isFcl: true,
    isEmpty: false,
    isOverDimension: false,
    tareWeight: "",
    vgmWeight: "",
    vgmCertified: false,
    sealNumber: "",
    customerId: "",
    vesselCallId: "",
  })

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers)
    fetch("/api/vessels?activeCalls=true").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setVesselCalls(data)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/containers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tareWeight: form.tareWeight ? parseFloat(form.tareWeight) : null,
        vgmWeight: form.vgmWeight ? parseFloat(form.vgmWeight) : null,
        customerId: form.customerId || null,
        vesselCallId: form.vesselCallId || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to create container")
      setLoading(false)
      return
    }

    router.push("/containers")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/containers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Containers
        </Link>
        <div className="flex items-center gap-3">
          <ContainerIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Register Container</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">ISO 6346 format — e.g. MSCU1234567</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Container Number *</label>
            <input
              type="text"
              required
              value={form.containerNumber}
              onChange={(e) => setForm({ ...form, containerNumber: e.target.value.toUpperCase() })}
              placeholder="MSCU1234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SIZE_20">20ft</option>
              <option value="SIZE_40">40ft</option>
              <option value="SIZE_45">45ft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={form.containerType}
              onChange={(e) => setForm({ ...form, containerType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRY">Dry</option>
              <option value="REEFER">Reefer</option>
              <option value="OPEN_TOP">Open Top</option>
              <option value="FLAT_RACK">Flat Rack</option>
              <option value="TANK">Tank</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vessel / Voyage</label>
            <select
              value={form.vesselCallId}
              onChange={(e) => setForm({ ...form, vesselCallId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select Vessel Call —</option>
              {vesselCalls.map((vc) => (
                <option key={vc.id} value={vc.id}>
                  {vc.vessel?.name}{vc.voyageNumber ? ` (${vc.voyageNumber})` : ""} — {vc.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seal Number</label>
            <input
              type="text"
              value={form.sealNumber}
              onChange={(e) => setForm({ ...form, sealNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tare Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              value={form.tareWeight}
              onChange={(e) => setForm({ ...form, tareWeight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VGM Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              value={form.vgmWeight}
              onChange={(e) => setForm({ ...form, vgmWeight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFcl}
              onChange={(e) => setForm({ ...form, isFcl: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">FCL (Full Container Load)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isEmpty}
              onChange={(e) => setForm({ ...form, isEmpty: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Empty</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isOverDimension}
              onChange={(e) => setForm({ ...form, isOverDimension: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Over-dimension (+30%)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.vgmCertified}
              onChange={(e) => setForm({ ...form, vgmCertified: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">VGM Certified (SOLAS)</span>
          </label>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? "Registering..." : "Register Container"}
          </button>
          <Link
            href="/containers"
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
