import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

export function useMeta() {
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/meta`)
      .then(r => r.json())
      .then(setMeta)
      .catch(() => setError('Could not reach backend. Is it running?'))
  }, [])

  return { meta, error }
}

export function usePredict() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const predict = async (formData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Prediction failed')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setError(null) }

  return { predict, result, loading, error, reset }
}
