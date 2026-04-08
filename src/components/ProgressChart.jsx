import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CHART_COLORS } from '../utils/chartColors'

export default function ProgressChart({ data, label, unit, color = CHART_COLORS.rose }) {
  if (!data || data.length < 2) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-300 text-sm" data-testid="chart-empty">
        Not enough data yet — log at least 2 entries to see a chart.
      </div>
    )
  }

  return (
    <div data-testid="progress-chart">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: CHART_COLORS.tickText }}
            tickFormatter={d => {
              const date = new Date(d + 'T00:00:00')
              return `${date.getDate()}/${date.getMonth() + 1}`
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.tickText }}
            domain={['auto', 'auto']}
            unit={unit ? ` ${unit}` : ''}
          />
          <Tooltip
            formatter={(value) => [`${value}${unit ? ' ' + unit : ''}`, label || 'Value']}
            labelFormatter={d => {
              const date = new Date(d + 'T00:00:00')
              return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
