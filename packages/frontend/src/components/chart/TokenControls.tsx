import React from 'react'

import { HorizontalSeparator } from '../HorizontalSeparator'
import { ChevronDownIcon } from '../icons'
import { CloseIcon } from '../icons/CloseIcon'
import { VerticalSeparator } from '../VerticalSeparator'

export interface TokenControl {
  address: string
  symbol: string
  name: string
  tvlEndpoint: string
}
export interface TokenControlsProps {
  tokens?: TokenControl[]
}

export function TokenControls({ tokens }: TokenControlsProps) {
  if (!tokens || tokens.length === 0) {
    return null
  }

  return (
    <div className="flex h-full gap-6">
      <div />
      <VerticalSeparator />
      <div className="flex flex-wrap items-baseline justify-start gap-x-4">
        <span>View another token</span>
        <div className="Dropdown">
          <div className="rounded-lg bg-gray-100 px-1 py-1 dark:bg-gray-750">
            <SelectButton />
            <SelectedTokenButton />
          </div>
          <TokenModal tokens={tokens} />
        </div>
      </div>
    </div>
  )
}

function SelectButton() {
  return (
    <label
      className="flex cursor-pointer items-center justify-between gap-1.5 px-2 text-base transition-all"
      data-role="chart-token-toggle"
    >
      <input
        type="checkbox"
        autoComplete="off"
        className="Dropdown-Button peer hidden"
      />
      Select
      <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 peer-checked:-rotate-180" />
    </label>
  )
}

function SelectedTokenButton() {
  return (
    <label
      className="flex hidden cursor-pointer items-center justify-between gap-1.5 rounded-md px-2 text-base transition-all dark:bg-black"
      data-role="chart-token-chosen"
    >
      <input
        type="checkbox"
        autoComplete="off"
        className="Dropdown-Button peer hidden"
      />
      <p>ARTH</p>
      <CloseIcon className="h-3 w-3 fill-gray-550 dark:fill-gray-50" />
    </label>
  )
}

function TokenCell({ token }: { token: TokenControl }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-1.5">
      <input
        className="peer hidden"
        name="token"
        type={'radio'}
        autoComplete="off"
        value={token.symbol}
        data-role="chart-token-controls"
        data-tvl-endpoint={token.tvlEndpoint}
      />
      <img
        src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`}
        className="h-4 w-4 rounded-full"
      />
      <p className="text-sm" key={token.symbol}>
        <span className={'font-bold'}>{token.name}</span> ({token.symbol})
      </p>
    </label>
  )
}

function TokenModal({ tokens }: { tokens: TokenControl[] }) {
  const parts = [
    {
      title: 'Natively Minted Tokens',
      titleColor: 'text-[#FF6DCD]',
      tokens: tokens.slice(0, 5),
    },
    {
      title: 'Externally Bridged Tokens',
      titleColor: 'text-yellow-200',
      tokens: tokens.slice(15, 25),
    },
    {
      title: 'Canonically Bridged Tokens',
      titleColor: 'text-[#D98EFF]',
      tokens: tokens.slice(30, 45),
    },
  ]

  return (
    <div
      className="Dropdown-Transparent-Item pointer-events-none absolute z-60 opacity-0 transition-opacity duration-300"
      data-role="chart-token-modal"
    >
      <hr className="h-1.5 border-t-0" />
      <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-750">
        <div className="flex flex-col gap-3">
          {parts.map((p, i) => (
            <div key={i}>
              <div className={`text-sm font-bold ${p.titleColor}`}>
                {p.title}
              </div>
              <HorizontalSeparator className="mb-4 dark:border-gray-650" />
              <div className="grid grid-cols-3 gap-y-3 gap-x-6">
                {p.tokens.map((token, j) => (
                  <TokenCell token={token} key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
