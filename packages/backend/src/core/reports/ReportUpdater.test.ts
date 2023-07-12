import { Logger } from '@l2beat/shared'
import { ChainId, ValueType } from '@l2beat/shared-pure'
import { expect, mockFn, mockObject } from 'earl'
import waitForExpect from 'wait-for-expect'

import { ReportRepository } from '../../peripherals/database/ReportRepository'
import { ReportStatusRepository } from '../../peripherals/database/ReportStatusRepository'
import { REPORTS_MOCK as MOCK } from '../../test/mockReports'
import { BalanceUpdater } from '../balances/BalanceUpdater'
import { Clock } from '../Clock'
import { PriceUpdater } from '../PriceUpdater'
import { getReportConfigHash } from './getReportConfigHash'
import { ReportUpdater } from './ReportUpdater'

describe(ReportUpdater.name, () => {
  describe(ReportUpdater.prototype.update.name, () => {
    it('calculates and saves reports', async () => {
      const priceUpdater = mockObject<PriceUpdater>({
        getPricesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_PRICES)
          .returnsOnce(MOCK.PRICES),
      })
      const balanceUpdater = mockObject<BalanceUpdater>({
        getBalancesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_BALANCES)
          .returnsOnce(MOCK.BALANCES),
      })
      const reportRepository = mockObject<ReportRepository>({
        addOrUpdateMany: async () => 0,
        getByTimestamp: async () => MOCK.FUTURE_REPORTS_WITH_OP,
      })

      const reportStatusRepository = mockObject<ReportStatusRepository>({
        getByConfigHash: async () => [],
        add: async ({ configHash }) => configHash,
      })

      const reportUpdater = new ReportUpdater(
        priceUpdater,
        balanceUpdater,
        reportRepository,
        reportStatusRepository,
        mockObject<Clock>(),
        MOCK.PROJECTS,
        Logger.SILENT,
      )

      await reportUpdater.update(MOCK.NOW.add(1, 'hours'))
      await reportUpdater.update(MOCK.NOW)

      const configHash = getReportConfigHash(MOCK.PROJECTS)

      expect(reportStatusRepository.add).toHaveBeenCalledTimes(2)
      expect(reportStatusRepository.add).toHaveBeenNthCalledWith(1, {
        configHash,
        timestamp: MOCK.NOW.add(1, 'hours'),
        chainId: ChainId.ETHEREUM,
        valueType: ValueType.CBV,
      })
      expect(reportStatusRepository.add).toHaveBeenNthCalledWith(2, {
        configHash,
        timestamp: MOCK.NOW,
        chainId: ChainId.ETHEREUM,
        valueType: ValueType.CBV,
      })

      expect(reportRepository.addOrUpdateMany).toHaveBeenCalledTimes(2)
      expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(
        1,
        MOCK.FUTURE_REPORTS_WITH_OP,
      )
      expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(
        2,
        MOCK.REPORTS,
      )

      const reports = await reportUpdater.getReportsWhenReady(
        MOCK.NOW.add(1, 'hours'),
      )
      // ensure that the updater updated internal knownSet
      expect(reports).toEqual(MOCK.FUTURE_REPORTS_WITH_OP)
    })
  })

  describe(ReportUpdater.prototype.start.name, () => {
    it('skips known timestamps', async () => {
      const priceUpdater = mockObject<PriceUpdater>({
        getPricesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_PRICES)
          .returnsOnce(MOCK.PRICES),
      })
      const balanceUpdater = mockObject<BalanceUpdater>({
        getBalancesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_BALANCES)
          .returnsOnce(MOCK.BALANCES),
      })
      const reportRepository = mockObject<ReportRepository>({
        addOrUpdateMany: async () => 0,
      })

      const reportStatusRepository = mockObject<ReportStatusRepository>({
        getByConfigHash: async () => [
          MOCK.NOW.add(-1, 'hours'),
          MOCK.NOW.add(2, 'hours'),
        ],
        add: async ({ configHash }) => configHash,
      })

      const clock = mockObject<Clock>({
        onEveryHour: (callback) => {
          callback(MOCK.NOW.add(-1, 'hours'))
          callback(MOCK.NOW)
          callback(MOCK.NOW.add(1, 'hours'))
          callback(MOCK.NOW.add(2, 'hours'))
          return () => {}
        },
      })

      const reportUpdater = new ReportUpdater(
        priceUpdater,
        balanceUpdater,
        reportRepository,
        reportStatusRepository,
        clock,
        MOCK.PROJECTS,
        Logger.SILENT,
      )

      await reportUpdater.start()

      await waitForExpect(() => {
        const configHash = getReportConfigHash(MOCK.PROJECTS)

        expect(reportStatusRepository.add).toHaveBeenCalledTimes(2)
        expect(reportStatusRepository.add).toHaveBeenNthCalledWith(1, {
          configHash,
          timestamp: MOCK.NOW.add(1, 'hours'),
          chainId: ChainId.ETHEREUM,
          valueType: ValueType.CBV,
        })
        expect(reportStatusRepository.add).toHaveBeenNthCalledWith(2, {
          configHash,
          timestamp: MOCK.NOW,
          chainId: ChainId.ETHEREUM,
          valueType: ValueType.CBV,
        })

        expect(reportRepository.addOrUpdateMany).toHaveBeenCalledTimes(2)
        expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(
          1,
          MOCK.FUTURE_REPORTS,
        )
        expect(reportRepository.addOrUpdateMany).toHaveBeenNthCalledWith(
          2,
          MOCK.REPORTS,
        )
      })
    })
  })

  describe(ReportUpdater.prototype.getReportsWhenReady.name, () => {
    it('returns known timestamps', async () => {
      const priceUpdater = mockObject<PriceUpdater>({
        getPricesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_PRICES)
          .returnsOnce(MOCK.PRICES),
      })
      const balanceUpdater = mockObject<BalanceUpdater>({
        getBalancesWhenReady: mockFn()
          .returnsOnce(MOCK.FUTURE_BALANCES)
          .returnsOnce(MOCK.BALANCES),
      })
      const reportRepository = mockObject<ReportRepository>({
        addOrUpdateMany: async () => 0,
        getByTimestamp: async () => MOCK.REPORTS,
      })

      const reportStatusRepository = mockObject<ReportStatusRepository>({
        getByConfigHash: async () => [
          MOCK.NOW.add(-1, 'hours'),
          MOCK.NOW.add(2, 'hours'),
        ],
        add: async ({ configHash }) => configHash,
      })

      const clock = mockObject<Clock>({
        onEveryHour: (callback) => {
          callback(MOCK.NOW.add(-1, 'hours'))
          callback(MOCK.NOW)
          callback(MOCK.NOW.add(1, 'hours'))
          callback(MOCK.NOW.add(2, 'hours'))
          return () => {}
        },
      })

      const reportUpdater = new ReportUpdater(
        priceUpdater,
        balanceUpdater,
        reportRepository,
        reportStatusRepository,
        clock,
        MOCK.PROJECTS,
        Logger.SILENT,
      )

      await reportUpdater.start()

      const reports = await reportUpdater.getReportsWhenReady(
        MOCK.NOW.add(-1, 'hours'),
      )

      expect(reports).toEqual(MOCK.REPORTS)
    })
  })
})
