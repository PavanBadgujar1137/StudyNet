/**
 * OpenHand — Range Calculator
 * Slider-driven income/fee calculator.
 * All labels, ranges, and math are passed as props — no hardcoded values.
 * locale: 'en-IN' for INR formatting (as in all mockup calculators).
 *
 * sliders: [{ id, label, min, max, step, value, format }]
 * compute: (values) => { net, gross, fee, bestPlan, bestPlanNote }
 */
import React, { useState, useCallback } from 'react'

const fmt = (n) => Math.round(n).toLocaleString('en-IN')

export function OHRangeCalculator({
  sliders = [],
  compute,
  dark = true,
  note = '',
  className = '',
}) {
  const [values, setValues] = useState(
    Object.fromEntries(sliders.map((s) => [s.id, s.value]))
  )

  const result = compute ? compute(values) : null

  const handleChange = useCallback((id, v) => {
    setValues((prev) => {
      const next = { ...prev, [id]: +v }
      return next
    })
  }, [])

  return (
    <div className={['oh-calc', dark ? 'oh-calc--dark' : '', className].filter(Boolean).join(' ')}>
      <div className="oh-calc__fields">
        {sliders.map((s) => {
          const display = s.format
            ? s.format(values[s.id])
            : fmt(values[s.id])
          return (
            <div className="oh-calc__field" key={s.id}>
              <label htmlFor={s.id} className="oh-calc__label">
                {s.label}
                <strong className="oh-calc__val">{display}</strong>
              </label>
              <input
                id={s.id}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step || 1}
                value={values[s.id]}
                onChange={(e) => handleChange(s.id, e.target.value)}
                className="oh-calc__slider"
                aria-label={s.label}
              />
            </div>
          )
        })}
      </div>

      {result && (
        <div className="oh-calc__readout">
          <p className="oh-calc__readout-label">You keep, per month</p>
          <p className="oh-calc__readout-big">₹{fmt(result.net)}</p>
          <p className="oh-calc__readout-sub">
            <span>₹{fmt(result.gross)}</span> collected
            <br />minus <span>₹{fmt(result.fee)}</span> to OpenHand
          </p>
          {result.bestPlan && (
            <p className="oh-calc__readout-best">
              Best plan for you: <strong>{result.bestPlan}</strong>
            </p>
          )}
        </div>
      )}

      {note && (
        <p className="oh-calc__note">{note}</p>
      )}
    </div>
  )
}

export default OHRangeCalculator
