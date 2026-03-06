"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Receipt, ArrowLeft, Plus, Trash2, Calendar } from "lucide-react"
import Link from "next/link"

interface Customer { id: string; name: string }

interface LineItem {
  description: string
  clauseReference: string
  quantity: number
  unitRate: number
  surchargeType: string
  surchargeAmount: number
  lineTotal: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [customerId, setCustomerId] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [vatRate, setVatRate] = useState(18)
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", clauseReference: "", quantity: 1, unitRate: 0, surchargeType: "", surchargeAmount: 0, lineTotal: 0 },
  ])

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers)
  }, [])

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    // Recalculate line total
    const qty = Number(updated[index].quantity)
    const rate = Number(updated[index].unitRate)
    const surcharge = Number(updated[index].surchargeAmount)
    updated[index].lineTotal = qty * rate + surcharge
    setLineItems(updated)
  }

  function addLineItem() {
    setLineItems([...lineItems, { description: "", clauseReference: "", quantity: 1, unitRate: 0, surchargeType: "", surchargeAmount: 0, lineTotal: 0 }])
  }

  function removeLineItem(index: number) {
    if (lineItems.length <= 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const vatAmount = subtotal * (vatRate / 100)
  const total = subtotal + vatAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerId) { setError("Please select a customer"); return }
    if (lineItems.some((l) => !l.description || l.lineTotal <= 0)) {
      setError("All line items must have a description and amount > 0")
      return
    }

    setLoading(true)
    setError("")

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        currency,
        vatRate,
        dueDate: dueDate || null,
        notes: notes || null,
        lineItems,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message || "Failed to create invoice")
      setLoading(false)
      return
    }

    router.push("/billing")
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/billing" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Billing
        </Link>
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Reference TPA tariff clauses for each line item</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Select Customer —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="USD">USD</option>
                <option value="TZS">TZS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
              <input type="number" step="0.01" value={vatRate} onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1">Default: 30 days from issue</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Container MSCU1234567 services" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button type="button" onClick={addLineItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">
                <div className="col-span-4">
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input type="text" value={item.description} onChange={(e) => updateLineItem(i, "description", e.target.value)} placeholder="Service description" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Clause Ref</label>
                  <input type="text" value={item.clauseReference} onChange={(e) => updateLineItem(i, "clauseReference", e.target.value)} placeholder="Clause 32" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Qty</label>
                  <input type="number" step="0.01" value={item.quantity} onChange={(e) => updateLineItem(i, "quantity", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Unit Rate ($)</label>
                  <input type="number" step="0.01" value={item.unitRate} onChange={(e) => updateLineItem(i, "unitRate", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Line Total</label>
                  <div className="text-sm font-semibold text-gray-900 py-1.5">${item.lineTotal.toFixed(2)}</div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeLineItem(i)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT ({vatRate}%)</span>
                <span className="font-medium">${vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {loading ? "Creating..." : "Create Invoice (Draft)"}
          </button>
          <Link href="/billing" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
