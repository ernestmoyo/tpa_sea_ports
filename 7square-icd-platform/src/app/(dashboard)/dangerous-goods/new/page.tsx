"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Container { id: string; containerNumber: string }

export default function NewDGPage() {
  const router = useRouter()
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    containerId: "",
    imdgClass: "CLASS_3",
    unNumber: "",
    properShippingName: "",
    packingGroup: "",
    flashPoint: "",
    segregationGroup: "",
    notes: "",
  })

  useEffect(() => {
    fetch("/api/containers").then((r) => r.json()).then(setContainers)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!/^UN\d{4}$/.test(form.unNumber)) {
      setError("UN Number must be in format UN followed by 4 digits (e.g. UN1203)")
      setLoading(false)
      return
    }

    const res = await fetch("/api/dangerous-goods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        containerId: form.containerId || null,
        imdgClass: form.imdgClass,
        unNumber: form.unNumber,
        properShippingName: form.properShippingName,
        packingGroup: form.packingGroup || null,
        flashPoint: form.flashPoint || null,
        segregationGroup: form.segregationGroup || null,
        notes: form.notes || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to register dangerous goods")
      setLoading(false)
      return
    }

    router.push("/dangerous-goods")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dangerous-goods" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Dangerous Goods
        </Link>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Register Dangerous Goods</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">IMDG Code classification — surcharges: +10% handling, +20% storage</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UN Number *</label>
            <input type="text" required pattern="UN\d{4}" title="Format: UN followed by 4 digits (e.g. UN1203)" value={form.unNumber} onChange={(e) => setForm({ ...form, unNumber: e.target.value.toUpperCase() })} placeholder="e.g. UN1203" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
              <option value="">— None —</option>
              <option value="I">I - Great Danger</option>
              <option value="II">II - Medium Danger</option>
              <option value="III">III - Minor Danger</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flash Point</label>
            <input type="text" value={form.flashPoint} onChange={(e) => setForm({ ...form, flashPoint: e.target.value })} placeholder="e.g. 11°C" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Container</label>
            <select value={form.containerId} onChange={(e) => setForm({ ...form, containerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select —</option>
              {containers.map((c) => <option key={c.id} value={c.id}>{c.containerNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segregation Group</label>
            <input type="text" value={form.segregationGroup} onChange={(e) => setForm({ ...form, segregationGroup: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="submit" disabled={loading} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
            {loading ? "Registering..." : "Register DG"}
          </button>
          <Link href="/dangerous-goods" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
