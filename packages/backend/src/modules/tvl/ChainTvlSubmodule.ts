import { Logger } from '@l2beat/backend-tools'
import { HttpClient, UniversalEtherscanClient } from '@l2beat/shared'
import {
  capitalizeFirstLetter,
  ChainId,
  ProjectId,
  Token,
} from '@l2beat/shared-pure'
import { providers } from 'ethers'

import { ChainTvlConfig } from '../../config/Config'
import { TotalSupplyFormulaUpdater } from '../../core/assets/TotalSupplyFormulaUpdater'
import { BlockNumberUpdater } from '../../core/BlockNumberUpdater'
import { Clock } from '../../core/Clock'
import { PriceUpdater } from '../../core/PriceUpdater'
import { TotalSupplyProvider } from '../../core/totalSupply/TotalSupplyProvider'
import { TotalSupplyUpdater } from '../../core/totalSupply/TotalSupplyUpdater'
import { EthereumClient } from '../../peripherals/ethereum/EthereumClient'
import { MulticallClient } from '../../peripherals/ethereum/multicall/MulticallClient'
import { MulticallConfigEntry } from '../../peripherals/ethereum/multicall/types'
import { TvlSubmodule } from '../ApplicationModule'
import { TvlDatabase } from './types'

export function chainTvlSubmodule(
  chainId: ChainId,
  projectId: ProjectId,
  chainTvlConfig: ChainTvlConfig | false,
  tokens: Token[],
  multicallConfig: MulticallConfigEntry[],
  db: TvlDatabase,
  priceUpdater: PriceUpdater,
  http: HttpClient,
  clock: Clock,
  logger: Logger,
): TvlSubmodule | undefined {
  const name = `${capitalizeFirstLetter(ChainId.getName(chainId))}TvlModule`
  if (!chainTvlConfig) {
    logger.info(`${name} disabled`)
    return
  }

  // #region peripherals
  const provider = new providers.JsonRpcProvider(chainTvlConfig.providerUrl)

  const etherscanClient = new UniversalEtherscanClient(
    http,
    chainTvlConfig.etherscanApiUrl,
    chainTvlConfig.etherscanApiKey,
    chainTvlConfig.minBlockTimestamp,
    chainId,
    logger,
  )

  const ethereumClient = new EthereumClient(
    provider,
    logger,
    chainTvlConfig.providerCallsPerMinute,
  )

  const multicallClient = new MulticallClient(ethereumClient, multicallConfig)

  const totalSupplyProvider = new TotalSupplyProvider(multicallClient, chainId)

  // #endregion
  // #region updaters

  const blockNumberUpdater = new BlockNumberUpdater(
    etherscanClient,
    db.blockNumberRepository,
    clock,
    logger,
    chainId,
    chainTvlConfig.minBlockTimestamp,
  )

  const totalSupplyTokens = tokens.filter(
    (t) => t.chainId === chainId && t.formula === 'totalSupply',
  )
  const totalSupplyUpdater = new TotalSupplyUpdater(
    totalSupplyProvider,
    blockNumberUpdater,
    db.totalSupplyRepository,
    db.totalSupplyStatusRepository,
    clock,
    totalSupplyTokens,
    logger,
    chainId,
    chainTvlConfig.minBlockTimestamp,
  )

  const totalSupplyFormulaUpdater = new TotalSupplyFormulaUpdater(
    priceUpdater,
    totalSupplyUpdater,
    db.reportRepository,
    db.reportStatusRepository,
    projectId,
    chainId,
    clock,
    totalSupplyTokens,
    logger,
    chainTvlConfig.minBlockTimestamp,
  )
  // #endregion

  const start = async () => {
    logger = logger.for(name)
    logger.info('Starting')

    await blockNumberUpdater.start()
    await totalSupplyUpdater.start()
    await totalSupplyFormulaUpdater.start()

    logger.info('Started')
  }

  return {
    assetUpdaters: [totalSupplyFormulaUpdater],
    start,
  }
}
