import { formatTimestamp } from '../../../../utils'
import { formatTpsWithUnit } from '../../../../utils/formatTps'
import { RenderParams } from '../../renderer/ChartRenderer'
import { SeriesStyle } from '../../renderer/styles'
import { getEntriesByDays } from '../getEntriesByDays'
import { ChartControlsState } from '../types'

export function getActivityRenderParams(
  state: ChartControlsState,
): RenderParams<{ date: string; tps: number; ethTps: number }> {
  {
    if (state.data?.type !== 'activity') {
      throw new Error('Invalid data type')
    }

    const dataInRange = getEntriesByDays(
      state.timeRangeInDays,
      state.data.values,
    )

    const points = dataInRange.map(([timestamp, txs, ethTxs]) => {
      const tps = getTps(txs)
      const ethTps = getTps(ethTxs)
      return {
        series: state.showEthereumTransactions ? [ethTps, tps] : [tps],
        data: {
          date: formatTimestamp(timestamp, true),
          tps,
          ethTps,
        },
        milestone: state.milestones[timestamp],
      }
    })

    const formatYAxisLabel = (x: number) => formatTpsWithUnit(x)

    const seriesStyle: SeriesStyle[] = [
      {
        line: 'signature gradient',
        fill: 'signature gradient',
        point: 'redCircle',
      },
    ]
    if (state.showEthereumTransactions) {
      seriesStyle.unshift({
        line: 'blue gradient',
        fill: 'blue gradient',
        point: 'blueSquare',
      })
    }

    return {
      formatYAxisLabel,
      points,
      seriesStyle,
      renderHoverContents: () => '',
      useLogScale: state.useLogScale,
    }
  }
}

function getTps(dailyTransactions: number) {
  return dailyTransactions / (60 * 60 * 24)
}
