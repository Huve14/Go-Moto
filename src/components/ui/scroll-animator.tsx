'use client'

import { useEffect } from 'react'

/**
 * Wires the [data-animate] / [data-delay] CSS classes to an IntersectionObserver
 * so elements fade/slide in as they enter the viewport.
 *
 * Note: this observes elements present in the DOM at mount time. Since the
 * GoMoto homepage is fully server-rendered, all [data-animate] elements are
 * available immediately and no MutationObserver is required.
 */
export function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
