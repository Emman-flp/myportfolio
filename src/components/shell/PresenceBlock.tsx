'use client'

import Link from 'next/link'
import { Icon } from '@/components/primitives/Icon'

/**
 * Sidebar / drawer presence block. Spec §4.1, §5.5.
 *
 * Deviation #8 (spec §11): the reference shows a live count of other visitors
 * driven by a multiplayer backend. Until that exists here, `visitors` is null and
 * the block renders an obvious placeholder rather than a fabricated number.
 */
export function PresenceBlock({
  className,
  labelClass = 'mt-1 text-[10.5px] text-gray-400',
  chatClass = 'mt-3.5 font-mono text-[12px] text-gray-500',
  iconClass = 'h-4 w-4',
  visitors = null,
}: {
  className?: string
  labelClass?: string
  chatClass?: string
  iconClass?: string
  visitors?: number | null
}) {
  const showCount = typeof visitors === 'number' && visitors > 0

  return (
    <div className={`shrink-0 ${className ?? ''}`}>
      {showCount ? (
        <>
          <span className="presence-icons inline-flex items-center">
            <span className="presence-avatar" aria-hidden="true" />
            <span className="presence-avatar" aria-hidden="true" />
            <span className="presence-avatar" aria-hidden="true" />
            {visitors! > 4 && <span className="presence-more">+{visitors! - 4}</span>}
          </span>
          <p className={`presence-label ${labelClass}`}>
            <b className="presence-num">{visitors}</b> {visitors === 1 ? 'person' : 'people'} viewing now
          </p>
        </>
      ) : (
        <span className="font-mono text-[10.5px] text-gray-400" data-placeholder>
          [visitor count — wire to real data]
        </span>
      )}

      <Link href="/contact" className={`inline-flex w-fit items-center gap-2 hover:text-ink ${chatClass}`}>
        <Icon name="chat" className={`${iconClass} shrink-0`} />
        get in touch
      </Link>
    </div>
  )
}
