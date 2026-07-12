import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { LineChart, Line, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts'

const socket = io("http://localhost:3000")

function timeAgo(iso) {
  if (!iso) return "—"
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 2) return "just now"
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
}

function formatClock(iso) {
  if (!iso) return "--:--:--"
  return new Date(iso).toLocaleTimeString('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour12: false
  })
}

function tempColor(t) {
  if (t == null) return '#5C6773'
  if (t > 210) return '#E5484D'
  if (t < 160) return '#5B9BFF'
  return '#F2A93B'
}

function MachineCard({ machine, now }) {
  const isRunning = machine.status === "running"
  const stale = machine.timestamp && (now - new Date(machine.timestamp).getTime()) > 8000
  const temperature = machine.temperature
  const tColor = tempColor(temperature)
  const gradientId = `tempGradient-${machine.machineId}`

  return (
    <div className="relative bg-[#12161C] border border-[#232A33] rounded-sm overflow-hidden">
      {/* status rail */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${stale ? 'bg-[#4B5563]' : isRunning ? 'bg-[#3ECF6E]' : 'bg-[#E5484D]'
          }`}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] tracking-[0.18em] text-[#5C6773] font-mono uppercase">
              Unit {machine.id ?? '—'}
            </div>
            <h2 className="text-[#E8ECEF] text-lg font-semibold tracking-tight mt-0.5">
              {machine.machineId}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${stale ? 'bg-[#4B5563]' : isRunning ? 'bg-[#3ECF6E] animate-pulse' : 'bg-[#E5484D]'
                }`}
            />
            <span
              className={`text-[10px] font-mono tracking-[0.14em] uppercase ${stale ? 'text-[#5C6773]' : isRunning ? 'text-[#3ECF6E]' : 'text-[#E5484D]'
                }`}
            >
              {stale ? 'no signal' : isRunning ? 'running' : 'down'}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-[10px] tracking-[0.14em] text-[#5C6773] font-mono uppercase mb-1">
              Cycle count
            </div>
            <div className="text-[#E8ECEF] text-[34px] leading-none font-mono font-medium tabular-nums">
              {(machine.cycle_count ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.14em] text-[#5C6773] font-mono uppercase mb-1">
              Last update
            </div>
            <div className="text-[#8B95A1] text-sm font-mono tabular-nums">
              {formatClock(machine.timestamp)}
            </div>
            <div className="text-[#4B5563] text-[10px] font-mono mt-0.5">
              {timeAgo(machine.timestamp)}
            </div>
          </div>
        </div>

        {/* Temperature block */}
        <div className="mt-4 pt-4 border-t border-[#1C222B]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] tracking-[0.14em] text-[#5C6773] font-mono uppercase">
              Barrel temp
            </div>
            <div
              className="font-mono text-sm tabular-nums font-medium transition-colors duration-500"
              style={{ color: tColor }}
            >
              {temperature != null ? temperature.toFixed(1) : '—'}°C
            </div>
          </div>

          {machine.tempHistory?.length > 1 ? (
            <div className="h-12 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={machine.tempHistory} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tColor} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={tColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[150, 220]} hide />
                  <ReferenceLine y={210} stroke="#3A2A1E" strokeDasharray="2 3" />
                  <ReferenceLine y={160} stroke="#1E2A3A" strokeDasharray="2 3" />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke={tColor}
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                    fill={`url(#${gradientId})`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-12 flex items-center">
              <div className="text-[#4B5563] text-[10px] font-mono">gathering data…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [machines, setMachines] = useState({})
  const [now, setNow] = useState(Date.now())
  const [connected, setConnected] = useState(socket.connected)

  useEffect(() => {
    const onStatus = (data) => {
      setMachines(prev => {
        const prevHistory = prev[data.machineId]?.tempHistory || []
        const tempHistory = [...prevHistory, { time: data.timestamp, temperature: data.temperature }].slice(-20)
        return { ...prev, [data.machineId]: { ...data, tempHistory } }
      })
    }
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on("machine-status", onStatus)
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    const tick = setInterval(() => setNow(Date.now()), 1000)

    return () => {
      socket.off("machine-status", onStatus)
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      clearInterval(tick)
    }
  }, [])

  const list = Object.values(machines)
  const runningCount = list.filter(m => m.status === "running").length

  return (
    <div className="min-h-screen bg-[#0A0C0F] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1C222B]">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-[#5C6773] font-mono uppercase">
              Factory floor
            </div>
            <h1 className="text-[#E8ECEF] text-2xl font-semibold tracking-tight mt-1">
              Machine Monitor
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] tracking-[0.14em] text-[#5C6773] font-mono uppercase">
                Online
              </div>
              <div className="text-[#E8ECEF] font-mono text-sm tabular-nums">
                {runningCount} / {list.length}
              </div>
            </div>
            <div
              className={`flex items-center gap-1.5 border rounded-sm px-2.5 py-1.5 ${connected ? 'border-[#1E3A2A] bg-[#0F1A13]' : 'border-[#3A1E1E] bg-[#1A0F0F]'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#3ECF6E]' : 'bg-[#E5484D]'}`} />
              <span className={`text-[10px] font-mono uppercase tracking-[0.1em] ${connected ? 'text-[#3ECF6E]' : 'text-[#E5484D]'}`}>
                {connected ? 'linked' : 'lost'}
              </span>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-[#4B5563] font-mono text-sm">
              waiting for machine data…
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((machine, i) => (
              <MachineCard key={machine.machineId ?? i} machine={machine} now={now} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}