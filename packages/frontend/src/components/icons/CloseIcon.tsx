import classNames from 'classnames'
import React, { SVGAttributes } from 'react'

import { Icon } from './Icon'

export function CloseIcon(props: SVGAttributes<SVGElement>) {
  const { className, ...rest } = props
  return (
    <Icon
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-label="Close icon"
      fill="none"
      className={classNames('my-auto', className)}
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.57438 0.657625C1.39202 0.657673 1.21382 0.712103 1.06256 0.813958C0.911306 0.915812 0.793859 1.06046 0.725241 1.22941C0.656622 1.39837 0.639948 1.58395 0.677352 1.76242C0.714755 1.9409 0.804537 2.10417 0.935217 2.23136L6.70377 7.99991L0.935217 13.7685C0.847241 13.8529 0.777004 13.9541 0.728618 14.0661C0.680231 14.178 0.65467 14.2985 0.653429 14.4204C0.652188 14.5424 0.675293 14.6634 0.721392 14.7763C0.76749 14.8892 0.835655 14.9918 0.921894 15.078C1.00813 15.1643 1.11071 15.2324 1.22362 15.2785C1.33654 15.3246 1.45751 15.3477 1.57947 15.3465C1.70142 15.3452 1.8219 15.3197 1.93385 15.2713C2.0458 15.2229 2.14697 15.1527 2.23144 15.0647L8 9.29613L13.7686 15.0647C13.853 15.1527 13.9542 15.2229 14.0661 15.2713C14.1781 15.3197 14.2986 15.3452 14.4205 15.3465C14.5425 15.3477 14.6635 15.3246 14.7764 15.2785C14.8893 15.2324 14.9919 15.1643 15.0781 15.078C15.1643 14.9918 15.2325 14.8892 15.2786 14.7763C15.3247 14.6634 15.3478 14.5424 15.3466 14.4204C15.3453 14.2985 15.3198 14.178 15.2714 14.0661C15.223 13.9541 15.1528 13.8529 15.0648 13.7685L9.29622 7.99991L15.0648 2.23136C15.1972 2.1026 15.2877 1.93683 15.3243 1.75577C15.361 1.57471 15.342 1.38681 15.27 1.21669C15.1981 1.04657 15.0763 0.902163 14.9209 0.802403C14.7654 0.702643 14.5834 0.65218 14.3988 0.657625C14.1606 0.664721 13.9346 0.764252 13.7686 0.935132L8 6.70369L2.23144 0.935132C2.14602 0.84732 2.04386 0.777521 1.931 0.729857C1.81815 0.682193 1.69688 0.657632 1.57438 0.657625Z"
      />
    </Icon>
  )
}
