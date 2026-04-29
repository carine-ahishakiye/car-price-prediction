import { useState } from 'react'
import s from './PredictionForm.module.css'

const DEFAULTS = {
  brand: '', fuel: '', transmission: '', body_type: '',
  year: 2020, km_driven: 50000, engine_size: 2.0, previous_owners: 1
}

export default function PredictionForm({ meta, onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    const payload = {
      ...form,
      year: Number(form.year),
      km_driven: Number(form.km_driven),
      engine_size: parseFloat(form.engine_size),
      previous_owners: Number(form.previous_owners)
    }
    onSubmit(payload)
  }

  const isValid = form.brand && form.fuel && form.transmission && form.body_type

  if (!meta) return <div className={s.loading}>Connecting to backend…</div>

  return (
    <div className={s.form}>
      <div className={s.grid}>
        {/* Selects */}
        {[
          { key:'brand',        label:'Brand',        opts: meta.brands },
          { key:'fuel',         label:'Fuel Type',    opts: meta.fuels },
          { key:'transmission', label:'Transmission', opts: meta.transmissions },
          { key:'body_type',    label:'Body Type',    opts: meta.body_types },
        ].map(({ key, label, opts }) => (
          <div className={s.field} key={key}>
            <label className={s.label}>{label}</label>
            <select
              className={s.select}
              value={form[key]}
              onChange={e => set(key, e.target.value)}
            >
              <option value="">Select…</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        {/* Year */}
        <div className={s.field}>
          <label className={s.label}>
            Year <span className={s.val}>{form.year}</span>
          </label>
          <input type="range" className={s.range}
            min={2005} max={2025} value={form.year}
            onChange={e => set('year', e.target.value)} />
        </div>

        {/* KM */}
        <div className={s.field}>
          <label className={s.label}>
            KM Driven <span className={s.val}>{Number(form.km_driven).toLocaleString()}</span>
          </label>
          <input type="range" className={s.range}
            min={0} max={250000} step={1000} value={form.km_driven}
            onChange={e => set('km_driven', e.target.value)} />
        </div>

        {/* Engine */}
        <div className={s.field}>
          <label className={s.label}>
            Engine Size <span className={s.val}>{parseFloat(form.engine_size).toFixed(1)}L</span>
          </label>
          <input type="range" className={s.range}
            min={0.8} max={6.0} step={0.1} value={form.engine_size}
            onChange={e => set('engine_size', e.target.value)} />
        </div>

        {/* Owners */}
        <div className={s.field}>
          <label className={s.label}>Previous Owners</label>
          <div className={s.pills}>
            {[1,2,3,4].map(n => (
              <button key={n}
                className={`${s.pill} ${form.previous_owners === n ? s.pillActive : ''}`}
                onClick={() => set('previous_owners', n)}
              >{n}</button>
            ))}
          </div>
        </div>
      </div>

      <button
        className={`${s.btn} ${!isValid || loading ? s.btnDisabled : ''}`}
        onClick={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading ? (
          <><span className={s.spinner} /> Predicting…</>
        ) : (
          '⚡ Get Price Estimate'
        )}
      </button>
    </div>
  )
}
