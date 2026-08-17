import { useEffect, useState } from 'react'

export function useClock(interval = 30_000) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), interval)
    return () => window.clearInterval(timer)
  }, [interval])

  return now
}
