/** Spec §4.7. Two instances: under the hero (h-6) and above the footer (h-10). */
export function HalftoneDivider({ tall = false }: { tall?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`halftone halftone-wide mask-fade-x w-full ${
        tall ? 'mb-16 mt-2 h-10 opacity-[0.15]' : 'my-2 h-6 opacity-[0.18]'
      }`}
    />
  )
}
