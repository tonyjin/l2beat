import { Bytes, ChainId, EthereumAddress } from '@l2beat/shared-pure'
import { assert } from 'console'
import { utils } from 'ethers'

import { EthereumClient } from './EthereumClient'

export const MULTICALL_BATCH_SIZE = 150
export const MULTICALL_V1_BLOCK = 7929876
export const MULTICALL_V1_ADDRESS = EthereumAddress(
  '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
)
export const MULTICALL_V2_BLOCK = 12336033
export const MULTICALL_V2_ADDRESS = EthereumAddress(
  '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
)

export interface MulticallRequest {
  address: EthereumAddress
  data: Bytes
}

export interface MulticallResponse {
  success: boolean
  data: Bytes
}

export interface MulticallClient {
  getChainId(): ChainId
  multicall(
    requests: MulticallRequest[],
    blockNumber: number,
  ): Promise<MulticallResponse[]>
  multicallNamed(
    requests: Record<string, MulticallRequest>,
    blockNumber: number,
  ): Promise<Record<string, MulticallResponse>>
}

export class EthereumMulticallClient implements MulticallClient {
  constructor(private readonly ethereumClient: EthereumClient) {}

  getChainId() {
    return this.ethereumClient.getChainId()
  }

  async multicallNamed(
    requests: Record<string, MulticallRequest>,
    blockNumber: number,
  ): Promise<Record<string, MulticallResponse>> {
    const entries = Object.entries(requests)
    const results = await this.multicall(
      entries.map((x) => x[1]),
      blockNumber,
    )
    const resultEntries = results.map(
      (result, i) => [entries[i][0], result] as const,
    )
    return Object.fromEntries(resultEntries)
  }

  async multicall(requests: MulticallRequest[], blockNumber: number) {
    if (blockNumber < MULTICALL_V1_BLOCK) {
      return executeIndividual(this.ethereumClient, requests, blockNumber)
    }
    const batches = toBatches(requests, MULTICALL_BATCH_SIZE)
    const batchedResults = await Promise.all(
      batches.map((batch) => this.executeBatch(batch, blockNumber)),
    )
    return batchedResults.flat()
  }

  private async executeBatch(
    requests: MulticallRequest[],
    blockNumber: number,
  ): Promise<MulticallResponse[]> {
    if (blockNumber < MULTICALL_V2_BLOCK) {
      const encoded = encodeMulticallV1(requests)
      const result = await this.ethereumClient.call(
        {
          to: MULTICALL_V1_ADDRESS,
          data: encoded,
        },
        blockNumber,
      )
      return decodeMulticallV1(result)
    } else {
      const encoded = encodeMulticallV2(requests)
      const result = await this.ethereumClient.call(
        {
          to: MULTICALL_V2_ADDRESS,
          data: encoded,
        },
        blockNumber,
      )
      return decodeMulticallV2(result)
    }
  }
}

export const ARBITRUM_MULTICALL_BLOCK = 821923
export const ARBITRUM_MULTICALL_ADDRESS = EthereumAddress(
  '0x842eC2c7D803033Edf55E478F461FC547Bc54EB2',
)

export class ArbitrumMulticallClient {
  constructor(private readonly ethereumClient: EthereumClient) {
    assert(ethereumClient.getChainId() === ChainId.ARBITRUM)
  }

  getChainId() {
    return this.ethereumClient.getChainId()
  }

  async multicallNamed(
    requests: Record<string, MulticallRequest>,
    blockNumber: number,
  ): Promise<Record<string, MulticallResponse>> {
    const entries = Object.entries(requests)
    const results = await this.multicall(
      entries.map((x) => x[1]),
      blockNumber,
    )
    const resultEntries = results.map(
      (result, i) => [entries[i][0], result] as const,
    )
    return Object.fromEntries(resultEntries)
  }

  async multicall(requests: MulticallRequest[], blockNumber: number) {
    if (blockNumber < ARBITRUM_MULTICALL_BLOCK) {
      return executeIndividual(this.ethereumClient, requests, blockNumber)
    }
    const batches = toBatches(requests, MULTICALL_BATCH_SIZE)
    const batchedResults = await Promise.all(
      batches.map((batch) => this.executeBatch(batch, blockNumber)),
    )
    return batchedResults.flat()
  }

  private async executeBatch(
    requests: MulticallRequest[],
    blockNumber: number,
  ): Promise<MulticallResponse[]> {
    const encoded = encodeMulticallV2(requests)
    const result = await this.ethereumClient.call(
      {
        to: ARBITRUM_MULTICALL_ADDRESS,
        data: encoded,
      },
      blockNumber,
    )
    return decodeMulticallV2(result)
  }
}

async function executeIndividual(
  ethereumClient: EthereumClient,
  requests: MulticallRequest[],
  blockNumber: number,
): Promise<MulticallResponse[]> {
  const results = await Promise.all(
    requests.map((request) =>
      ethereumClient.call(
        {
          to: request.address,
          data: request.data,
        },
        blockNumber,
      ),
    ),
  )
  return results.map(
    (result): MulticallResponse => ({
      success: result.length !== 0,
      data: result,
    }),
  )
}

export function toBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  return batches
}

export const multicallInterface = new utils.Interface([
  'function aggregate(tuple(address target, bytes callData)[] calls) public returns (uint256 blockNumber, bytes[] returnData)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public returns (tuple(bool success, bytes returnData)[] returnData)',
])

export function encodeMulticallV1(requests: MulticallRequest[]) {
  const string = multicallInterface.encodeFunctionData('aggregate', [
    requests.map((request) => [
      request.address.toString(),
      request.data.toString(),
    ]),
  ])
  return Bytes.fromHex(string)
}

export function decodeMulticallV1(result: Bytes) {
  const decoded = multicallInterface.decodeFunctionResult(
    'aggregate',
    result.toString(),
  )
  const values = decoded[1] as string[]
  return values.map(
    (data): MulticallResponse => ({
      success: data !== '0x',
      data: Bytes.fromHex(data),
    }),
  )
}

export function encodeMulticallV2(requests: MulticallRequest[]) {
  const string = multicallInterface.encodeFunctionData('tryAggregate', [
    false,
    requests.map((request) => [
      request.address.toString(),
      request.data.toString(),
    ]),
  ])
  return Bytes.fromHex(string)
}

export function decodeMulticallV2(result: Bytes) {
  const decoded = multicallInterface.decodeFunctionResult(
    'tryAggregate',
    result.toString(),
  )
  const values = decoded[0] as [boolean, string][]
  return values.map(([success, data]): MulticallResponse => {
    const bytes = Bytes.fromHex(data)
    return {
      success: success && bytes.length !== 0,
      data: bytes,
    }
  })
}
