import { SessionProvider } from "@/components/providers/session-provider"
import { Sidebar } from "@/components/shared/sidebar"
import { ToastProvider } from "@/components/shared/toast"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </SessionProvider>
  )
}
