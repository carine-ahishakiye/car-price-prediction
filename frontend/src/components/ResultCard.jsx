import { useEffect, useState } from 'react'
import s from './ResultCard.module.css'

function AnimatedNumber({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <>${val.toLocaleString()}</>
}

export default function ResultCard({ result, error, onReset }) {
  if (error) return (
    <div className={s.error}>
      <span className={s.errorIcon}>⚠</span>
      <p>{error}</p>
      <button className={s.resetBtn} onClick={onReset}>Try Again</button>
    </div>
  )

  if (!result) return null

  const { predicted_price, price_range, confidence } = result

  return (
    <div className={s.card}>
      <div className={s.badge}>Estimated Value</div>

      <div className={s.price}>
        <AnimatedNumber target={predicted_price} />
      </div>

      <div className={s.range}>
        <div className={s.rangeItem}>
          <span className={s.rangeLabel}>Low</span>
          <span className={s.rangeVal}>${price_range.low.toLocaleString()}</span>
        </div>
        <div className={s.rangeBar}>
          <div className={s.rangeTrack} />
          <div className={s.rangeDot} />
        </div>
        <div className={s.rangeItem}>
          <span className={s.rangeLabel}>High</span>
          <span className={s.rangeVal}>${price_range.high.toLocaleString()}</span>
        </div>
      </div>

      <div className={s.meta}>
        <div className={s.metaItem}>
          <span className={s.metaLabel}>Confidence</span>
          <span className={`${s.metaBadge} ${s[confidence]}`}>{confidence}</span>
        </div>
        <div className={s.metaItem}>
          <span className={s.metaLabel}>Model</span>
          <span className={s.metaText}>Gradient Boosting</span>
        </div>
      </div>

      <button className={s.resetBtn} onClick={onReset}>
        ← New Prediction
      </button>
    </div>
  )
}
