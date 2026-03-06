"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Container as ContainerIcon,
  ArrowLeft,
  Truck,
  Package,
  AlertTriangle,
  FileText,
  Wrench,
  Thermometer,
  Zap,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronRight,
  Warehouse,
  Anchor,
  ShieldCheck,
  Scale,
  Box,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContainerData {
  id: string
  containerNumber: string
  size: string
  containerType: string
  status: string
  isFcl: boolean
  isEmpty: boolean
  isOverDimension: boolean
  tareWeight: number | null
  vgmWeight: number | null
  vgmCertified: boolean
  sealNumber: string | null
  customerId: string | null
  vesselCallId: string | null
  createdAt: string
  updatedAt: string
  customer: { id: string; name: string; companyName?: string } | null
  vesselCall: {
    id: string
    voyageNumber?: string
    vessel: { id: string; name: string; imoNumber?: string }
  } | null
  cargos: { id: string; cargo: CargoItem }[]
  storageBookings: StorageBooking[]
  dangerousGoods: DGRecord[]
  documents: DocumentRecord[]
  operations: OperationRecord[]
  reeferLogs: ReeferLog[]
  reeferPowerLogs: ReeferPowerLog[]
}

interface CargoItem {
  id: string
  description: string
  hsCode?: string
  weightKg: number
  volumeCbm?: number
  harbourTonnes: number
  cifValueUsd?: number
  cargoType: string
  isDangerous: boolean
  packageCount?: number
}

interface StorageBooking {
  id: string
  checkInDate: string
  checkOutDate: string | null
  trafficType: string
  freePeriodDays: number
  status: string
  notes: string | null
  slot: {
    slotCode: string
    warehouse: { name: string; warehouseType: string }
  }
}

interface DGRecord {
  id: string
  imdgClass: string
  unNumber: string
  properShippingName: string
  packingGroup: string | null
  flashPoint: string | null
  segregationGroup: string | null
  emergencySchedule: string | null
  notes: string | null
}

interface DocumentRecord {
  id: string
  documentType: string
  documentNumber: string | null
  fileName: string
  uploadedAt: string
}

interface OperationRecord {
  id: string
  operationType: string
  startedAt: string
  completedAt: string | null
  isOvertime: boolean
  notes: string | null
  performedBy?: { name: string } | null
}

interface ReeferLog {
  id: string
  timestamp: string
  setTemperature: number
  actualTemperature: number
  humidity: number | null
  powerStatus: boolean
  alertGenerated: boolean
  alertMessage: string | null
}

interface ReeferPowerLog {
  id: string
  connectDate: string
  disconnectDate: string | null
  dailyRate: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIFECYCLE_STAGES = [
  "ARRIVING",
  "RECEIVED",
  "IN_STORAGE",
  "UNDER_OPERATION",
  "READY_FOR_RELEASE",
  "RELEASED",
  "DEPARTED",
] as const

const statusColors: Record<string, string> = {
  ARRIVING: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-yellow-100 text-yellow-700",
  IN_STORAGE: "bg-green-100 text-green-700",
  UNDER_OPERATION: "bg-orange-100 text-orange-700",
  READY_FOR_RELEASE: "bg-purple-100 text-purple-700",
  RELEASED: "bg-gray-100 text-gray-700",
  DEPARTED: "bg-gray-100 text-gray-500",
}

const statusDotColors: Record<string, string> = {
  ARRIVING: "bg-blue-500",
  RECEIVED: "bg-yellow-500",
  IN_STORAGE: "bg-green-500",
  UNDER_OPERATION: "bg-orange-500",
  READY_FOR_RELEASE: "bg-purple-500",
  RELEASED: "bg-gray-500",
  DEPARTED: "bg-gray-400",
}

const sizeLabels: Record<string, string> = {
  SIZE_20: "20ft",
  SIZE_40: "40ft",
  SIZE_45: "45ft",
}

/** Maps a current status to the valid next statuses a user can transition to. */
const validTransitions: Record<string, string[]> = {
  ARRIVING: ["RECEIVED"],
  RECEIVED: ["IN_STORAGE", "UNDER_OPERATION"],
  IN_STORAGE: ["UNDER_OPERATION", "READY_FOR_RELEASE"],
  UNDER_OPERATION: ["IN_STORAGE", "READY_FOR_RELEASE"],
  READY_FOR_RELEASE: ["RELEASED"],
  RELEASED: ["DEPARTED"],
  DEPARTED: [],
}

const TABS = [
  { key: "cargo", label: "Cargo", icon: Package },
  { key: "storage", label: "Storage", icon: Warehouse },
  { key: "dg", label: "Dangerous Goods", icon: AlertTriangle },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "operations", label: "Operations", icon: Wrench },
  { key: "reefer", label: "Reefer", icon: Thermometer },
] as const

type TabKey = (typeof TABS)[number]["key"]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(date: string | null | undefined): string {
  if (!date) return "\u2014"
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function fmtCurrency(amount: number | null | undefined): string {
  if (amount == null) return "\u2014"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function stageLabel(s: string) {
  return s.replace(/_/g, " ")
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContainerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [container, setContainer] = useState<ContainerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("cargo")

  // Fetch container
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/containers/${id}`)
        if (!res.ok) {
          setError(res.status === 404 ? "Container not found." : "Failed to load container.")
          return
        }
        const data = await res.json()
        setContainer(data)
      } catch {
        setError("Network error while loading container.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Status update
  async function updateStatus(newStatus: string) {
    if (!container) return
    setUpdating(true)
    setError("")
    try {
      const res = await fetch(`/api/containers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || "Failed to update status.")
        return
      }
      const updated = await res.json()
      setContainer((prev) => (prev ? { ...prev, ...updated } : prev))
    } catch {
      setError("Network error while updating status.")
    } finally {
      setUpdating(false)
    }
  }

  // Delete
  async function handleDelete() {
    setDeleting(true)
    setError("")
    try {
      const res = await fetch(`/api/containers/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || "Failed to delete container.")
        setDeleting(false)
        return
      }
      router.push("/containers")
    } catch {
      setError("Network error while deleting.")
      setDeleting(false)
    }
  }

  // Loading / error states
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!container) {
    return (
      <div>
        <Link href="/containers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Containers
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-4">
          {error || "Container not found."}
        </div>
      </div>
    )
  }

  const currentIdx = LIFECYCLE_STAGES.indexOf(container.status as typeof LIFECYCLE_STAGES[number])
  const nextStatuses = validTransitions[container.status] ?? []
  const isReefer = container.containerType === "REEFER"

  return (
    <div className="max-w-6xl">
      {/* Back link */}
      <Link href="/containers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Containers
      </Link>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <ContainerIcon className="h-7 w-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{container.containerNumber}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[container.status]}`}>
                {stageLabel(container.status)}
              </span>
              <span className="text-sm text-gray-500">
                {sizeLabels[container.size]} {container.containerType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* LIFECYCLE PROGRESS BAR                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Container Lifecycle</h2>
        <div className="flex items-center w-full">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIdx
            const isCurrent = idx === currentIdx
            const isFuture = idx > currentIdx
            return (
              <div key={stage} className="flex items-center flex-1 last:flex-none">
                {/* Step circle + label */}
                <div className="flex flex-col items-center relative">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2
                      ${isCompleted ? "bg-blue-600 border-blue-600 text-white" : ""}
                      ${isCurrent ? `border-2 ${statusDotColors[stage]} border-current ring-4 ring-opacity-30 ring-blue-300 text-white` : ""}
                      ${isCurrent ? statusDotColors[stage] : ""}
                      ${isFuture ? "bg-gray-100 border-gray-300 text-gray-400" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Circle className="h-4 w-4 fill-current" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 text-center whitespace-nowrap font-medium ${
                      isCurrent ? "text-gray-900" : isCompleted ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {stageLabel(stage)}
                  </span>
                </div>
                {/* Connecting line */}
                {idx < LIFECYCLE_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 ${
                      idx < currentIdx ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* STATUS UPDATE BUTTONS                                               */}
      {/* ------------------------------------------------------------------ */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((ns) => (
              <button
                key={ns}
                disabled={updating}
                onClick={() => updateStatus(ns)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition
                  ${statusColors[ns]} border-current hover:opacity-80 disabled:opacity-50`}
              >
                <ChevronRight className="h-4 w-4" />
                {stageLabel(ns)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* DETAILS GRID                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Container Details</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          <DetailItem icon={<ContainerIcon className="h-4 w-4" />} label="Container #" value={container.containerNumber} mono />
          <DetailItem icon={<Box className="h-4 w-4" />} label="Size" value={sizeLabels[container.size]} />
          <DetailItem icon={<Box className="h-4 w-4" />} label="Type" value={container.containerType} />
          <DetailItem icon={<Package className="h-4 w-4" />} label="FCL / LCL" value={container.isFcl ? "FCL" : "LCL"} />
          <DetailItem icon={<Truck className="h-4 w-4" />} label="Customer" value={container.customer?.name ?? "\u2014"} />
          <DetailItem icon={<Anchor className="h-4 w-4" />} label="Vessel" value={container.vesselCall?.vessel?.name ?? "\u2014"} />
          <DetailItem icon={<ShieldCheck className="h-4 w-4" />} label="Seal #" value={container.sealNumber ?? "\u2014"} />
          <DetailItem icon={<Scale className="h-4 w-4" />} label="Tare Weight" value={container.tareWeight != null ? `${container.tareWeight} kg` : "\u2014"} />
          <DetailItem icon={<Scale className="h-4 w-4" />} label="VGM Weight" value={container.vgmWeight != null ? `${container.vgmWeight} kg` : "\u2014"} />
          <DetailItem
            icon={<ShieldCheck className="h-4 w-4" />}
            label="VGM Certified"
            value={container.vgmCertified ? "Yes (SOLAS)" : "No"}
            highlight={container.vgmCertified ? "text-green-600" : undefined}
          />
          <DetailItem
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Over-dimension"
            value={container.isOverDimension ? "Yes (+30%)" : "No"}
            highlight={container.isOverDimension ? "text-orange-600" : undefined}
          />
          <DetailItem
            icon={<Package className="h-4 w-4" />}
            label="Empty"
            value={container.isEmpty ? "Yes" : "No"}
          />
        </dl>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TABS                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.filter((t) => t.key !== "reefer" || isReefer).map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.key === "dg" && container.dangerousGoods.length > 0 && (
                  <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {container.dangerousGoods.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === "cargo" && <CargoTab cargos={container.cargos} />}
          {activeTab === "storage" && <StorageTab bookings={container.storageBookings} />}
          {activeTab === "dg" && <DGTab records={container.dangerousGoods} />}
          {activeTab === "documents" && <DocumentsTab documents={container.documents} />}
          {activeTab === "operations" && <OperationsTab operations={container.operations} />}
          {activeTab === "reefer" && isReefer && (
            <ReeferTab logs={container.reeferLogs} powerLogs={container.reeferPowerLogs} />
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DELETE                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg border border-red-200 p-5">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h2>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-red-600 border border-red-300 px-4 py-2 rounded-md hover:bg-red-50 transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete Container
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-700">
              Are you sure? This action cannot be undone.
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DetailItem({
  icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
  highlight?: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
        {icon}
        {label}
      </dt>
      <dd className={`font-medium text-gray-900 ${mono ? "font-mono" : ""} ${highlight ?? ""}`}>{value}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab panels
// ---------------------------------------------------------------------------

function CargoTab({ cargos }: { cargos: ContainerData["cargos"] }) {
  if (cargos.length === 0) {
    return <EmptyState text="No cargo items linked to this container." />
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="pb-2 font-medium text-gray-600">Description</th>
          <th className="pb-2 font-medium text-gray-600">HS Code</th>
          <th className="pb-2 font-medium text-gray-600">Type</th>
          <th className="pb-2 font-medium text-gray-600 text-right">Weight (kg)</th>
          <th className="pb-2 font-medium text-gray-600 text-right">HT</th>
          <th className="pb-2 font-medium text-gray-600 text-right">CIF Value</th>
          <th className="pb-2 font-medium text-gray-600 text-right">Pkgs</th>
        </tr>
      </thead>
      <tbody>
        {cargos.map((cc) => (
          <tr key={cc.id} className="border-t border-gray-100">
            <td className="py-2 text-gray-900">{cc.cargo.description}</td>
            <td className="py-2 text-gray-500 font-mono text-xs">{cc.cargo.hsCode ?? "\u2014"}</td>
            <td className="py-2 text-gray-600 text-xs">{cc.cargo.cargoType.replace(/_/g, " ")}</td>
            <td className="py-2 text-gray-700 text-right">{Number(cc.cargo.weightKg).toLocaleString()}</td>
            <td className="py-2 text-gray-700 text-right">{Number(cc.cargo.harbourTonnes).toFixed(2)}</td>
            <td className="py-2 text-gray-700 text-right">{fmtCurrency(cc.cargo.cifValueUsd != null ? Number(cc.cargo.cifValueUsd) : null)}</td>
            <td className="py-2 text-gray-700 text-right">{cc.cargo.packageCount ?? "\u2014"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StorageTab({ bookings }: { bookings: StorageBooking[] }) {
  if (bookings.length === 0) {
    return <EmptyState text="No storage bookings for this container." />
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="pb-2 font-medium text-gray-600">Warehouse</th>
          <th className="pb-2 font-medium text-gray-600">Slot</th>
          <th className="pb-2 font-medium text-gray-600">Check-in</th>
          <th className="pb-2 font-medium text-gray-600">Check-out</th>
          <th className="pb-2 font-medium text-gray-600">Traffic</th>
          <th className="pb-2 font-medium text-gray-600 text-center">Free Days</th>
          <th className="pb-2 font-medium text-gray-600">Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id} className="border-t border-gray-100">
            <td className="py-2 text-gray-900">{b.slot.warehouse.name}</td>
            <td className="py-2 font-mono text-xs text-gray-600">{b.slot.slotCode}</td>
            <td className="py-2 text-gray-700">{fmtDate(b.checkInDate)}</td>
            <td className="py-2 text-gray-700">{fmtDate(b.checkOutDate)}</td>
            <td className="py-2 text-gray-600 text-xs">{b.trafficType.replace(/_/g, " ")}</td>
            <td className="py-2 text-gray-700 text-center">{b.freePeriodDays}</td>
            <td className="py-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  b.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : b.status === "COMPLETED"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {b.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DGTab({ records }: { records: DGRecord[] }) {
  if (records.length === 0) {
    return <EmptyState text="No dangerous goods records linked to this container." />
  }
  return (
    <div className="space-y-4">
      {records.map((dg) => (
        <div key={dg.id} className="border border-red-200 rounded-lg p-4 bg-red-50/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="font-semibold text-gray-900">{dg.properShippingName}</span>
            <span className="text-xs font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded">{dg.unNumber}</span>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-gray-500">IMDG Class</dt>
              <dd className="font-medium text-gray-900">{dg.imdgClass.replace(/_/g, " ").replace("CLASS ", "Class ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Packing Group</dt>
              <dd className="font-medium text-gray-900">{dg.packingGroup ?? "\u2014"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Flash Point</dt>
              <dd className="font-medium text-gray-900">{dg.flashPoint ?? "\u2014"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Segregation Group</dt>
              <dd className="font-medium text-gray-900">{dg.segregationGroup ?? "\u2014"}</dd>
            </div>
          </dl>
          {dg.notes && <p className="mt-2 text-xs text-gray-600">{dg.notes}</p>}
        </div>
      ))}
    </div>
  )
}

function DocumentsTab({ documents }: { documents: DocumentRecord[] }) {
  if (documents.length === 0) {
    return <EmptyState text="No documents linked to this container." />
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="pb-2 font-medium text-gray-600">Type</th>
          <th className="pb-2 font-medium text-gray-600">Document #</th>
          <th className="pb-2 font-medium text-gray-600">File Name</th>
          <th className="pb-2 font-medium text-gray-600">Uploaded</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((d) => (
          <tr key={d.id} className="border-t border-gray-100">
            <td className="py-2">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                {d.documentType.replace(/_/g, " ")}
              </span>
            </td>
            <td className="py-2 font-mono text-xs text-gray-700">{d.documentNumber ?? "\u2014"}</td>
            <td className="py-2 text-gray-900">{d.fileName}</td>
            <td className="py-2 text-gray-600">{fmtDate(d.uploadedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function OperationsTab({ operations }: { operations: OperationRecord[] }) {
  if (operations.length === 0) {
    return <EmptyState text="No operations recorded for this container." />
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="pb-2 font-medium text-gray-600">Operation</th>
          <th className="pb-2 font-medium text-gray-600">Started</th>
          <th className="pb-2 font-medium text-gray-600">Completed</th>
          <th className="pb-2 font-medium text-gray-600 text-center">Overtime</th>
          <th className="pb-2 font-medium text-gray-600">Notes</th>
        </tr>
      </thead>
      <tbody>
        {operations.map((op) => (
          <tr key={op.id} className="border-t border-gray-100">
            <td className="py-2">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                {op.operationType.replace(/_/g, " ")}
              </span>
            </td>
            <td className="py-2 text-gray-700">{fmtDate(op.startedAt)}</td>
            <td className="py-2 text-gray-700">{fmtDate(op.completedAt)}</td>
            <td className="py-2 text-center">
              {op.isOvertime ? (
                <span className="text-orange-600 font-bold text-xs">OT</span>
              ) : (
                <span className="text-gray-300">\u2014</span>
              )}
            </td>
            <td className="py-2 text-gray-500 text-xs max-w-xs truncate">{op.notes ?? "\u2014"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ReeferTab({ logs, powerLogs }: { logs: ReeferLog[]; powerLogs: ReeferPowerLog[] }) {
  return (
    <div className="space-y-6">
      {/* Power Logs */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Zap className="h-4 w-4 text-yellow-500" />
          Power Logs
        </h3>
        {powerLogs.length === 0 ? (
          <EmptyState text="No reefer power logs recorded." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-2 font-medium text-gray-600">Connected</th>
                <th className="pb-2 font-medium text-gray-600">Disconnected</th>
                <th className="pb-2 font-medium text-gray-600 text-right">Daily Rate</th>
              </tr>
            </thead>
            <tbody>
              {powerLogs.map((pl) => (
                <tr key={pl.id} className="border-t border-gray-100">
                  <td className="py-2 text-gray-700">{fmtDate(pl.connectDate)}</td>
                  <td className="py-2 text-gray-700">{fmtDate(pl.disconnectDate)}</td>
                  <td className="py-2 text-gray-700 text-right">{fmtCurrency(Number(pl.dailyRate))}/day</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Temperature Readings */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Thermometer className="h-4 w-4 text-cyan-500" />
          Temperature Readings (Latest 10)
        </h3>
        {logs.length === 0 ? (
          <EmptyState text="No temperature readings recorded." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-2 font-medium text-gray-600">Timestamp</th>
                <th className="pb-2 font-medium text-gray-600 text-right">Set Temp</th>
                <th className="pb-2 font-medium text-gray-600 text-right">Actual Temp</th>
                <th className="pb-2 font-medium text-gray-600 text-right">Humidity</th>
                <th className="pb-2 font-medium text-gray-600 text-center">Power</th>
                <th className="pb-2 font-medium text-gray-600">Alert</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const tempDiff = Math.abs(Number(log.actualTemperature) - Number(log.setTemperature))
                const tempWarning = tempDiff > 2
                return (
                  <tr key={log.id} className={`border-t border-gray-100 ${log.alertGenerated ? "bg-red-50/50" : ""}`}>
                    <td className="py-2 text-gray-700 text-xs">{fmtDate(log.timestamp)}</td>
                    <td className="py-2 text-gray-700 text-right">{Number(log.setTemperature).toFixed(1)}&deg;C</td>
                    <td className={`py-2 text-right font-medium ${tempWarning ? "text-red-600" : "text-gray-700"}`}>
                      {Number(log.actualTemperature).toFixed(1)}&deg;C
                    </td>
                    <td className="py-2 text-gray-600 text-right">
                      {log.humidity != null ? `${Number(log.humidity).toFixed(1)}%` : "\u2014"}
                    </td>
                    <td className="py-2 text-center">
                      {log.powerStatus ? (
                        <span className="text-green-600 font-bold text-xs">ON</span>
                      ) : (
                        <span className="text-red-600 font-bold text-xs">OFF</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-red-600">{log.alertGenerated ? log.alertMessage || "Alert" : "\u2014"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-gray-400 py-6 text-center">{text}</p>
}
