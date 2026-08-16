import { useEffect, useState } from 'react'

interface Props {
  /** The moment predictions lock (kickoff minus the lock window) */
  target: Date
}

const getRemainingMs = (targetTime: number) => Math.max(0, targetTime - Date.now())

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

const ONE_HOUR_MS = 60 * 60 * 1000
const TEN_MINUTES_MS = 10 * 60 * 1000

const PredictionCountdown = ({ target }: Props) => {
  const [remaining, setRemaining] = useState(() => getRemainingMs(target.getTime()))

  useEffect(() => {
    setRemaining(getRemainingMs(target.getTime()))
    const interval = setInterval(() => {
      setRemaining(getRemainingMs(target.getTime()))
    }, 1000)
    return () => clearInterval(interval)
  }, [target])

  if (isNaN(target.getTime())) {
    return null
  }

  if (remaining <= 0) {
    return <span className="prediction-countdown prediction-countdown--locked">Predictions locked</span>
  }

  const urgency = remaining <= TEN_MINUTES_MS ? 'urgent' : remaining <= ONE_HOUR_MS ? 'soon' : 'normal'

  return (
    <span className={`prediction-countdown prediction-countdown--${urgency}`}>
      <span className="prediction-countdown-dot" />
      Locks in {formatDuration(remaining)}
    </span>
  )
}

export default PredictionCountdown
