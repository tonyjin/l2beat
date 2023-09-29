import { Milestone } from '@l2beat/config'

import {
  ActivityResponse,
  AggregateDetailedTvlResponse,
  AggregateTvlResponse,
  TokenTvlResponse,
} from '../types'

export type ChartData =
  | ChartTvlData
  | ChartActivityData
  | ChartDetailedTvlData
  | ChartTokenTvlData

interface ChartTvlData {
  type: 'tvl'
  values: AggregateTvlResponse
}

interface ChartActivityData {
  type: 'activity'
  values: ActivityResponse
}

interface ChartDetailedTvlData {
  type: 'detailed-tvl'
  values: AggregateDetailedTvlResponse
}

interface ChartTokenTvlData {
  type: 'token-tvl'
  tokenType: 'CBV' | 'EBV' | 'NMV'
  values: TokenTvlResponse
}

export interface ChartControlsState {
  data?: ChartData
  timeRangeInDays: number
  useAltCurrency?: boolean
  showEthereumTransactions?: boolean
  useLogScale: boolean
  milestones: Record<number, Milestone>
}
