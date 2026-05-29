import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to `target` on mount, then tracks `target` directly
 * after the first animation completes. Re-animates on component remount.
 */
export function useCountUp(target: number, duration = 850): number {
  const [value, setValue] = useState(0)
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) {
      setValue(target)
      return
    }
    mounted.current = true
    if (!target) return

    let raf: number
    const t0 = performance.now()

    function tick(now: number) {
      const elapsed = now - t0
      const p = Math.min(elapsed / duration, 1)
      // ease-out quart — fast start, satisfying deceleration
      const eased = 1 - Math.pow(1 - p, 4)
      setValue(Math.round(target * eased))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return value
}
