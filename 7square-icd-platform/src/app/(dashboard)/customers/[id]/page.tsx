"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Users, ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react"

const typeLabels: Record<string, string> = {
  IMPORTER: "Importer",
  EXPORTER: "Exporter",
  SHIPPING_AGENT: "Shipping Agent",
  CLEARING_AGENT: "Clearing Agent",
  SHIP_OWNER: "Ship Owner",
  TERMINAL_OPERATOR: "Terminal Operator",
  TRANSIT_CLIENT: "Transit Client",
}

const countryFlags: Record<string, string> = {
  TZ: "🇹🇿",
  ZM: "🇿🇲",
  CD: "🇨🇩",
  BI: "🇧🇮",
  RW: "🇷🇼",
  MW: "🇲🇼",
  UG: "🇺🇬",
  ZW: "🇿🇼",
}

const countryNames: Record<string, string> = {
  TZ: "Tanzania",
  ZM: "Zambia",
  CD: "DRC",
  BI: "Burundi",
  RW: "Rwanda",
  MW: "Malawi",
  UG: "Uganda",
  ZW: "Zimbabwe",
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

const invoiceStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ISSUED: "bg-blue-100 text-blue-800",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  CREDITED: "bg-purple-100 text-purple-800",
}

interface Customer {
  id: string
  name: string
  customerType: string
  companyName: string | null
  country: string
  address: string | null
  phone: string | null
  email: string | null
  taxId: string | null
  notes?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  containers: Array<{
    id: string
    containerNumber: string
    size: string
    containerType: string
    status: string
  }>
  invoices: Array<{
    id: string
    invoiceNumber: string
    totalAmount: number | string
    status: string
    issuedDate: string | null
    createdAt: string
  }>
  cargos: Array<{
    id: string
    description: string
    cargoType: string
    weightKg: number | string
    harbourTonnes: number | string
  }>
}

function formatDate(date: string | null) {
  if (!date) return "--"
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount))
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    customerType: "IMPORTER",
    country: "TZ",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    notes: "",
  })

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Customer not found")
        return r.json()
      })
      .then((data: Customer) => {
        setCustomer(data)
        setForm({
          name: data.name,
          companyName: data.companyName ?? "",
          customerType: data.customerType,
          country: data.country,
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          taxId: data.taxId ?? "",
          notes: data.notes ?? "",
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

    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        companyName: form.companyName || null,
        customerType: form.customerType,
        country: form.country,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        taxId: form.taxId || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to update customer")
      setSaving(false)
      return
    }

    const updated = await res.json()
    setCustomer((prev) => (prev ? { ...prev, ...updated } : prev))
    setEditing(false)
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/customers")
    } else {
      const data = await res.json()
      setError(data.message || "Failed to delete customer")
      setDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading customer...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div>
        <Link href="/customers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-4">
          {error || "Customer not found"}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/customers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-green-600" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                <span className="text-lg">{countryFlags[customer.country]}</span>
              </div>
              {customer.companyName && (
                <p className="text-sm text-gray-500">{customer.companyName}</p>
              )}
            </div>
            <span className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
              {typeLabels[customer.customerType] ?? customer.customerType}
            </span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={form.customerType}
                  onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IMPORTER">Importer</option>
                  <option value="EXPORTER">Exporter</option>
                  <option value="SHIPPING_AGENT">Shipping Agent</option>
                  <option value="CLEARING_AGENT">Clearing Agent</option>
                  <option value="SHIP_OWNER">Ship Owner</option>
                  <option value="TERMINAL_OPERATOR">Terminal Operator</option>
                  <option value="TRANSIT_CLIENT">Transit Client</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TZ">Tanzania</option>
                  <option value="ZM">Zambia</option>
                  <option value="CD">DRC</option>
                  <option value="BI">Burundi</option>
                  <option value="RW">Rwanda</option>
                  <option value="MW">Malawi</option>
                  <option value="UG">Uganda</option>
                  <option value="ZW">Zimbabwe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TIN (Tax ID)</label>
                <input
                  type="text"
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                    name: customer.name,
                    companyName: customer.companyName ?? "",
                    customerType: customer.customerType,
                    country: customer.country,
                    email: customer.email ?? "",
                    phone: customer.phone ?? "",
                    address: customer.address ?? "",
                    taxId: customer.taxId ?? "",
                    notes: customer.notes ?? "",
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
              <span className="text-gray-500">Type</span>
              <p className="font-medium text-gray-900">{typeLabels[customer.customerType]}</p>
            </div>
            <div>
              <span className="text-gray-500">Country</span>
              <p className="font-medium text-gray-900">{countryFlags[customer.country]} {countryNames[customer.country]}</p>
            </div>
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium text-gray-900">{customer.email ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium text-gray-900">{customer.phone ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Address</span>
              <p className="font-medium text-gray-900">{customer.address ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">TIN (Tax ID)</span>
              <p className="font-medium text-gray-900">{customer.taxId ?? "--"}</p>
            </div>
            <div>
              <span className="text-gray-500">Registered</span>
              <p className="font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Containers */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Containers ({customer.containers?.length ?? 0})</h2>
        </div>
        {customer.containers && customer.containers.length > 0 ? (
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
              {customer.containers.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3">
                    <Link href={`/containers/${c.id}`} className="text-blue-600 hover:underline font-medium">
                      {c.containerNumber}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{containerSizeLabels[c.size] ?? c.size}</td>
                  <td className="p-3 text-gray-600">{c.containerType}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${containerStatusColors[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">No containers linked to this customer.</div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Invoices ({customer.invoices?.length ?? 0})</h2>
        </div>
        {customer.invoices && customer.invoices.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Invoice #</th>
                <th className="text-right p-3 font-medium text-gray-700">Amount</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
                <th className="text-left p-3 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {customer.invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3">
                    <Link href={`/billing/${inv.id}`} className="text-blue-600 hover:underline font-medium">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-3 text-right font-medium text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${invoiceStatusColors[inv.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {inv.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{formatDate(inv.issuedDate ?? inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">No invoices for this customer.</div>
        )}
      </div>

      {/* Cargo */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Cargo ({customer.cargos?.length ?? 0})</h2>
        </div>
        {customer.cargos && customer.cargos.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Description</th>
                <th className="text-left p-3 font-medium text-gray-700">Type</th>
                <th className="text-right p-3 font-medium text-gray-700">Weight (kg)</th>
                <th className="text-right p-3 font-medium text-gray-700">Harbour Tonnes</th>
              </tr>
            </thead>
            <tbody>
              {customer.cargos.map((cargo) => (
                <tr key={cargo.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="p-3">
                    <Link href={`/cargo/${cargo.id}`} className="text-blue-600 hover:underline font-medium">
                      {cargo.description}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{cargo.cargoType.replace(/_/g, " ")}</td>
                  <td className="p-3 text-right text-gray-900">{Number(cargo.weightKg).toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-900">{Number(cargo.harbourTonnes).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">No cargo linked to this customer.</div>
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
            Delete Customer
          </button>
        )}
      </div>
    </div>
  )
}
