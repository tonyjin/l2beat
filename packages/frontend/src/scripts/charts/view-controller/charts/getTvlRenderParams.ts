import { formatCurrency } from '../../../../components/chart/configure/update/view/format'
import { formatTimestamp } from '../../../../utils'
import { getTvlHover } from '../../htmls'
import { RenderParams } from '../../renderer/ChartRenderer'
import { SeriesStyle } from '../../styles'
import { getEntriesByDays } from '../getEntriesByDays'
import { ChartControlsState } from '../types'

export function getTvlRenderParams(
  state: ChartControlsState,
): RenderParams<{ date: string; usd: number; eth: number }> {
  if (state.data?.type !== 'tvl') {
    throw new Error('Invalid data type')
  }

  const dataInRange = getEntriesByDays(
    state.timeRangeInDays,
    state.data.values,
    { trimLeft: true },
  )

  const points = dataInRange.map(([timestamp, usd, eth]) => ({
    series: [state.useAltCurrency ? eth : usd],
    data: {
      date: formatTimestamp(timestamp, true),
      usd,
      eth,
    },
    milestone: state.milestones[timestamp],
  }))

  const formatYAxisLabel = state.useAltCurrency
    ? (x: number) => formatCurrency(x, 'eth')
    : (x: number) => formatCurrency(x, 'usd')

  const seriesStyle: SeriesStyle[] = [
    {
      line: 'signature gradient',
      fill: 'signature gradient',
      point: 'circle',
    },
  ]

  return {
    formatYAxisLabel,
    points,
    seriesStyle,
    renderHoverContents: getTvlHover,
    useLogScale: state.useLogScale,
  }
}
