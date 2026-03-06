"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Receipt, Printer } from "lucide-react"

interface LineItem {
  id: string
  description: string
  clauseReference: string | null
  quantity: number
  unitRate: number
  surchargeType: string | null
  surchargeAmount: number
  lineTotal: number
}

interface Payment {
  id: string
  amount: number
  currency: string
  paymentDate: string
  paymentMethod: string
  reference: string | null
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  currency: string
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  notes: string | null
  createdAt: string
  issuedDate: string | null
  dueDate: string | null
  customer: { id: string; name: string }
  lineItems: LineItem[]
  payments: Payment[]
  issuedBy: { name: string } | null
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ISSUED: "bg-blue-100 text-blue-700",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  CREDITED: "bg-purple-100 text-purple-700",
}

function fmtCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

function fmtDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Payment modal state
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState("BANK_TRANSFER")
  const [payReference, setPayReference] = useState("")

  useEffect(() => {
    fetchInvoice()
  }, [id])

  async function fetchInvoice() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/invoices/${id}`)
      if (!res.ok) throw new Error("Invoice not found")
      const data = await res.json()
      setInvoice(data)
      setPayAmount(String(Number(data.totalAmount)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load invoice")
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: string, extra: Record<string, unknown> = {}) {
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed to ${action}`)
      }
      await fetchInvoice()
      setShowPaymentModal(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActionLoading(false)
    }
  }

  function handleRecordPayment() {
    handleAction("pay", {
      paymentMethod: payMethod,
      reference: payReference || null,
    })
  }

  function openPaymentModal() {
    if (invoice) {
      setPayAmount(String(Number(invoice.totalAmount)))
    }
    setPayMethod("BANK_TRANSFER")
    setPayReference("")
    setShowPaymentModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading invoice...</div>
      </div>
    )
  }

  if (error && !invoice) {
    return (
      <div className="max-w-4xl">
        <Link href="/billing" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Billing
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-4">{error}</div>
      </div>
    )
  }

  if (!invoice) return null

  const cur = invoice.currency || "USD"

  return (
    <>
      {/* Print stylesheet */}
      <style>{`
        @media print {
          nav, aside, [data-sidebar], [data-no-print], .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/billing" className="no-print flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="h-6 w-6 text-yellow-600" />
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[invoice.status] || "bg-gray-100 text-gray-700"}`}>
                {invoice.status}
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-2 text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4 no-print">{error}</div>
        )}

        {/* Workflow action buttons */}
        <div className="no-print flex gap-3 mb-6">
          {invoice.status === "DRAFT" && (
            <button
              onClick={() => handleAction("issue")}
              disabled={actionLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {actionLoading ? "Processing..." : "Issue Invoice"}
            </button>
          )}

          {(invoice.status === "ISSUED" || invoice.status === "OVERDUE") && (
            <>
              <button
                onClick={openPaymentModal}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                Record Payment
              </button>
              {invoice.status === "ISSUED" && (
                <button
                  onClick={() => handleAction("overdue")}
                  disabled={actionLoading}
                  className="border border-red-300 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
                >
                  Mark Overdue
                </button>
              )}
              <button
                onClick={() => handleAction("cancel")}
                disabled={actionLoading}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
              >
                Cancel Invoice
              </button>
            </>
          )}

          {invoice.status === "PAID" && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-2 text-sm font-medium">
              Paid in full
            </div>
          )}
        </div>

        {/* Invoice details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Customer</span>
              <p className="font-medium text-gray-900">{invoice.customer.name}</p>
            </div>
            <div>
              <span className="text-gray-500">Invoice Number</span>
              <p className="font-mono font-medium text-gray-900">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">Currency</span>
              <p className="font-medium text-gray-900">{invoice.currency}</p>
            </div>
            <div>
              <span className="text-gray-500">Created</span>
              <p className="font-medium text-gray-900">{fmtDate(invoice.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Issued Date</span>
              <p className="font-medium text-gray-900">{invoice.issuedDate ? fmtDate(invoice.issuedDate) : "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Due Date</span>
              <p className="font-medium text-gray-900">{invoice.dueDate ? fmtDate(invoice.dueDate) : "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Status</span>
              <p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[invoice.status] || "bg-gray-100 text-gray-700"}`}>
                  {invoice.status}
                </span>
              </p>
            </div>
            {invoice.notes && (
              <div className="col-span-2">
                <span className="text-gray-500">Notes</span>
                <p className="font-medium text-gray-900">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Line items table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Description</th>
                <th className="text-left p-3 font-medium text-gray-700">Clause Ref</th>
                <th className="text-right p-3 font-medium text-gray-700">Qty</th>
                <th className="text-right p-3 font-medium text-gray-700">Unit Rate</th>
                <th className="text-right p-3 font-medium text-gray-700">Surcharge</th>
                <th className="text-right p-3 font-medium text-gray-700">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-3 text-gray-900">{item.description}</td>
                  <td className="p-3 text-gray-600 font-mono text-xs">{item.clauseReference || "—"}</td>
                  <td className="p-3 text-right text-gray-900">{Number(item.quantity)}</td>
                  <td className="p-3 text-right text-gray-900">{fmtCurrency(Number(item.unitRate), cur)}</td>
                  <td className="p-3 text-right text-gray-900">{fmtCurrency(Number(item.surchargeAmount), cur)}</td>
                  <td className="p-3 text-right font-semibold text-gray-900">{fmtCurrency(Number(item.lineTotal), cur)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={5} className="p-3 text-right text-sm text-gray-600">Subtotal</td>
                <td className="p-3 text-right font-medium text-gray-900">{fmtCurrency(Number(invoice.subtotal), cur)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td colSpan={5} className="p-3 text-right text-sm text-gray-600">VAT ({Number(invoice.vatRate)}%)</td>
                <td className="p-3 text-right font-medium text-gray-900">{fmtCurrency(Number(invoice.vatAmount), cur)}</td>
              </tr>
              <tr className="bg-gray-50 border-t border-gray-300">
                <td colSpan={5} className="p-3 text-right text-sm font-bold text-gray-900">Total</td>
                <td className="p-3 text-right text-lg font-bold text-gray-900">{fmtCurrency(Number(invoice.totalAmount), cur)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payments section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
          </div>
          {invoice.payments.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No payments recorded yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">Date</th>
                  <th className="text-right p-3 font-medium text-gray-700">Amount</th>
                  <th className="text-left p-3 font-medium text-gray-700">Method</th>
                  <th className="text-left p-3 font-medium text-gray-700">Reference</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((pay) => (
                  <tr key={pay.id} className="border-t border-gray-100">
                    <td className="p-3 text-gray-900">{fmtDate(pay.paymentDate)}</td>
                    <td className="p-3 text-right font-semibold text-green-700">{fmtCurrency(Number(pay.amount), pay.currency || cur)}</td>
                    <td className="p-3 text-gray-600">{pay.paymentMethod.replace(/_/g, " ")}</td>
                    <td className="p-3 text-gray-600 font-mono text-xs">{pay.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. TXN-12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                {actionLoading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
