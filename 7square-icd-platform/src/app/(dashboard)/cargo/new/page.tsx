"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  name: string
}

export default function NewCargoPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    packageCount: "",
    destinationCountry: "",
    customerId: "",
  })

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers)
  }, [])

  const harbourTonnes = Math.max(
    parseFloat(form.weightKg || "0") / 1000,
    parseFloat(form.volumeCbm || "0")
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/cargo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        hsCode: form.hsCode || null,
        weightKg: parseFloat(form.weightKg),
        volumeCbm: form.volumeCbm ? parseFloat(form.volumeCbm) : null,
        cifValueUsd: form.cifValueUsd ? parseFloat(form.cifValueUsd) : null,
        cargoType: form.cargoType,
        isDangerous: form.isDangerous,
        isColdStorage: form.isColdStorage,
        isValuable: form.isValuable,
        packageCount: form.packageCount ? parseInt(form.packageCount) : null,
        destinationCountry: form.destinationCountry || null,
        customerId: form.customerId || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to register cargo")
      setLoading(false)
      return
    }

    router.push("/cargo")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/cargo" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Cargo
        </Link>
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Register Cargo</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Harbour Tonnes = max(weight/1000, volume CBM)</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Electronic equipment, cement bags"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Packages</label>
            <input
              type="number"
              value={form.packageCount}
              onChange={(e) => setForm({ ...form, packageCount: e.target.value })}
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
              <option value="">— Select —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {(form.cargoType.startsWith("TRANSIT") || form.cargoType === "TRANSSHIPMENT") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
              <select
                value={form.destinationCountry}
                onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select —</option>
                <option value="ZM">Zambia</option>
                <option value="CD">DRC</option>
                <option value="BI">Burundi</option>
                <option value="RW">Rwanda</option>
                <option value="MW">Malawi</option>
                <option value="UG">Uganda</option>
                <option value="ZW">Zimbabwe</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isDangerous} onChange={(e) => setForm({ ...form, isDangerous: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Dangerous Goods (+10%/+20%)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isColdStorage} onChange={(e) => setForm({ ...form, isColdStorage: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Cold Storage (+30%)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isValuable} onChange={(e) => setForm({ ...form, isValuable: e.target.checked })} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Valuable Cargo</span>
          </label>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {loading ? "Registering..." : "Register Cargo"}
          </button>
          <Link href="/cargo" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
