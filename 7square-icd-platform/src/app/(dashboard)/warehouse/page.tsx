export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Warehouse, Plus, LayoutGrid } from "lucide-react"
import Link from "next/link"

async function getWarehouseData() {
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      slots: { select: { id: true, isOccupied: true, slotType: true } },
    },
    orderBy: { name: "asc" },
  })

  const activeBookings = await prisma.storageBooking.count({ where: { status: "ACTIVE" } })

  return { warehouses, activeBookings }
}

const typeColors: Record<string, string> = {
  BONDED: "bg-blue-100 text-blue-700",
  FREE: "bg-green-100 text-green-700",
  REEFER_YARD: "bg-cyan-100 text-cyan-700",
  DG_ZONE: "bg-red-100 text-red-700",
  OPEN_YARD: "bg-yellow-100 text-yellow-700",
}

export default async function WarehousePage() {
  const { warehouses, activeBookings } = await getWarehouseData()

  const totalCapacity = warehouses.reduce((sum, w) => sum + w.totalCapacityTeu, 0)
  const totalOccupiedSlots = warehouses.reduce((sum, w) => sum + w.slots.filter((s) => s.isOccupied).length, 0)
  const totalSlots = warehouses.reduce((sum, w) => sum + w.slots.length, 0)
  const occupancyRate = totalSlots > 0 ? Math.round((totalOccupiedSlots / totalSlots) * 100) : totalCapacity > 0 ? Math.round((warehouses.reduce((s, w) => s + w.currentOccupancy, 0) / totalCapacity) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Warehouse className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          </div>
          <p className="text-sm text-gray-500">Bonded & free warehouse operations with slot-level tracking</p>
        </div>
        <Link
          href="/warehouse/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Link>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
          <p className="text-sm text-gray-500">Warehouses</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalCapacity} TEU</p>
          <p className="text-sm text-gray-500">Total Capacity</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className={`text-2xl font-bold ${occupancyRate > 80 ? "text-red-600" : "text-green-600"}`}>
            {occupancyRate}%
          </p>
          <p className="text-sm text-gray-500">Occupancy Rate</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{activeBookings}</p>
          <p className="text-sm text-gray-500">Active Bookings</p>
        </div>
      </div>

      {/* Warehouse cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((wh) => {
          const occupiedSlots = wh.slots.filter((s) => s.isOccupied).length
          const totalSlots = wh.slots.length
          const slotOccupancy = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0

          return (
            <div key={wh.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{wh.name}</h3>
                  {wh.location && <p className="text-xs text-gray-400">{wh.location}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[wh.warehouseType]}`}>
                  {wh.warehouseType.replace(/_/g, " ")}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{wh.totalCapacityTeu} TEU</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Occupancy</span>
                  <span className="font-medium">{wh.currentOccupancy} TEU</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Slots</span>
                  <span className="font-medium">{occupiedSlots}/{totalSlots} occupied</span>
                </div>

                {/* Occupancy bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${slotOccupancy > 80 ? "bg-red-500" : slotOccupancy > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${slotOccupancy}%` }}
                  />
                </div>

                {/* Slot type breakdown */}
                <div className="flex gap-2 pt-1">
                  {Object.entries(
                    wh.slots.reduce((acc, s) => {
                      acc[s.slotType] = (acc[s.slotType] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <span key={type} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {type.replace(/_/g, " ")}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
