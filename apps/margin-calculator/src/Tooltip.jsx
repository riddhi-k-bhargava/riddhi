import { useState, useRef, useEffect } from 'react'

// Info icon that reveals help text on hover, keyboard focus, AND tap.
// - hover/focus: transient (shows while pointer/focus is on the icon)
// - tap/click: pins it open until tapped again or focus leaves
export default function Tooltip({ text, label = 'More info' }) {
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!pinned) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setPinned(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [pinned])

  const open = hover || pinned

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={(e) => {
          e.preventDefault()
          setPinned((p) => !p)
        }}
        className="flex h-[15px] w-[15px] items-center justify-center rounded-full border border-ink-muted/50 text-[9px] font-medium leading-none text-ink-muted transition-colors hover:border-accent hover:text-accent focus:border-accent focus:text-accent"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-[22px] z-30 w-[248px] -translate-x-1/2 rounded-lg border border-hair bg-warm-white px-3.5 py-3 text-[12px] font-light leading-[1.55] text-ink-soft shadow-[0_8px_28px_rgba(28,26,23,0.14)]"
        >
          {text}
        </span>
      )}
    </span>
  )
}
