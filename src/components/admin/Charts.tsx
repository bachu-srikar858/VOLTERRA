interface Point {
  label: string
  value: number
}

export function BarChart({ data, height = 180, color = '#ff4d00', valuePrefix = '$' }: { data: Point[]; height?: number; color?: string; valuePrefix?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }} aria-hidden>
        {data.map((d, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className="w-full bg-volt-mist transition-all duration-300 group-hover:bg-volt-line"
              style={{ height: `${Math.max((d.value / max) * 100, 1.5)}%` }}
            >
              <div className="h-full w-full transition-colors group-hover:bg-volt-graphite" style={{ backgroundColor: d.value > 0 ? color : undefined }} />
            </div>
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap bg-volt-black px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {valuePrefix}{d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden>
        {data.map((d, i) => (
          <div key={i} className="flex-1 truncate text-center text-[9px] text-volt-graphite/50">{d.label}</div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ data, height = 180, color = '#0a0a0a' }: { data: Point[]; height?: number; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const w = 100
  const h = 100
  const pts = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w
    const y = h - (d.value / max) * h
    return { x, y }
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height, width: '100%' }} role="img" aria-label="Trend chart">
        <path d={area} fill={color} opacity="0.08" />
        <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.4" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[9px] text-volt-graphite/50">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}
