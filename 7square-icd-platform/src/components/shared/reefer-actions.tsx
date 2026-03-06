"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, ZapOff, ThermometerSun } from "lucide-react"

interface ReeferActionsProps {
  containerId: string
  containerNumber: string
  isConnected: boolean
}

export function ReeferPowerButton({ containerId, containerNumber, isConnected }: ReeferActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const res = await fetch("/api/reefer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: isConnected ? "disconnect" : "connect",
        containerId,
      }),
    })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.message || "Failed")
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
        isConnected
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-green-50 text-green-700 hover:bg-green-100"
      }`}
      title={isConnected ? `Disconnect ${containerNumber}` : `Connect ${containerNumber}`}
    >
      {isConnected ? <ZapOff className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
      {loading ? "..." : isConnected ? "Disconnect" : "Connect"}
    </button>
  )
}

export function TempLogButton({ containerId }: { containerId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [setTemp, setSetTemp] = useState("")
  const [actualTemp, setActualTemp] = useState("")
  const [humidity, setHumidity] = useState("")

  async function handleLog() {
    if (!setTemp || !actualTemp) return
    setLoading(true)
    const res = await fetch("/api/reefer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "log_temperature",
        containerId,
        setTemperature: parseFloat(setTemp),
        actualTemperature: parseFloat(actualTemp),
        humidity: humidity ? parseFloat(humidity) : null,
      }),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(false)
      setSetTemp("")
      setActualTemp("")
      setHumidity("")
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.message || "Failed to log temperature")
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
      >
        <ThermometerSun className="h-3 w-3" />
        Log Temp
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        step="0.1"
        placeholder="Set°C"
        value={setTemp}
        onChange={(e) => setSetTemp(e.target.value)}
        className="w-16 px-1 py-0.5 border rounded text-xs"
      />
      <input
        type="number"
        step="0.1"
        placeholder="Act°C"
        value={actualTemp}
        onChange={(e) => setActualTemp(e.target.value)}
        className="w-16 px-1 py-0.5 border rounded text-xs"
      />
      <button
        onClick={handleLog}
        disabled={loading || !setTemp || !actualTemp}
        className="px-2 py-0.5 bg-cyan-600 text-white rounded text-xs disabled:opacity-50"
      >
        {loading ? "..." : "Save"}
      </button>
      <button onClick={() => setOpen(false)} className="px-1 py-0.5 text-gray-400 text-xs">
        X
      </button>
    </div>
  )
}
