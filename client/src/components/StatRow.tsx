import { Tooltip } from './Tooltip'

interface StatRowProps {
  label: string
  tooltip: string
  value: string
}

export const StatRow = ({ label, tooltip, value }: StatRowProps) => (
  <div className="flex justify-between">
    <Tooltip text={tooltip}>
      <span className="font-medium">{label}</span>
    </Tooltip>
    <span>{value}</span>
  </div>
)
