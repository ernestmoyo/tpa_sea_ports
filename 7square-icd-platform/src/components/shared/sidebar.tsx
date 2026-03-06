"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Container,
  Warehouse,
  Ship,
  FileText,
  Receipt,
  AlertTriangle,
  Thermometer,
  Users,
  BarChart3,
  BookOpen,
  Package,
  LogOut,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vessels", href: "/vessels", icon: Ship },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Containers", href: "/containers", icon: Container },
  { name: "Cargo", href: "/cargo", icon: Package },
  { name: "Warehouse", href: "/warehouse", icon: Warehouse },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Dangerous Goods", href: "/dangerous-goods", icon: AlertTriangle },
  { name: "Reefer", href: "/reefer", icon: Thermometer },
  { name: "Tariffs", href: "/tariffs", icon: BookOpen },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/7square-logo.png"
            alt="7Square"
            width={120}
            height={120}
            className="rounded"
          />
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">7Square ICD</h1>
            <p className="text-xs text-gray-400">Operations Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-600">
              {session?.user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.role || ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full mb-3"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        <div className="pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">www.7squareinc.com</p>
          <p className="text-[10px] text-gray-400">info@7squareinc.com</p>
        </div>
      </div>
    </aside>
  )
}
