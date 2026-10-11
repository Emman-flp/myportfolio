/**
 * Shared inner-page frame. Spec §8.
 * Reference pattern: <div class="relative z-10 mx-auto max-w-{N} px-6 py-14 sm:py-20">
 * with `page-enter-motion` on route change.
 */

const WIDTH = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
} as const

export type PageWidth = keyof typeof WIDTH

export function PageShell({
  width,
  children,
}: {
  width: PageWidth
  children: React.ReactNode
}) {
  return (
    <main id="top" className="relative z-10 lg:pl-56">
      <div
        className={`page-enter-motion relative z-10 mx-auto ${WIDTH[width]} px-6 py-14 sm:py-20`}
      >
        {children}
      </div>
    </main>
  )
}
