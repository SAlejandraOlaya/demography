import { useState, useEffect } from 'react'
import axios from 'axios'
import type { ModelsResponse, DemographyResponse } from './types/api'

const API_BASE = 'http://localhost:8000'

const App = () => {
  const [model, setModel] = useState<string[]>([])
  const [selectModel, setSelectModel] = useState<string>('')
  const [place, setPlace] = useState<string>('')
  const [data, setData] = useState<string | null>(null)
  const [charging, setCharging] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get<ModelsResponse>(`${API_BASE}/models`)
      .then((response) => {
        setModel(response.data.models)
        setSelectModel(response.data.models[0])
      })
      .catch((err) => {
        setError(axios.isAxiosError(err) ? err.message : 'Error al cargar modelos')
      })
  }, [])

  const handleSearch = () => {
    if (!place.trim()) return
    setError(null)
    setData(null)
    setCharging(true)

    axios.get<DemographyResponse>(`${API_BASE}/demography/${encodeURIComponent(place.trim())}?model=${selectModel}`)
      .then((response) => {
        setData(response.data.data)
      })
      .catch((err) => {
        setError(axios.isAxiosError(err) ? (err.response?.data?.detail as string) || err.message : 'Error desconocido')
      })
      .finally(() => {
        setCharging(false)
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Demografía
          </h1>
          <p className="mt-2 text-slate-600">
            Consulta datos demográficos por lugar usando distintos modelos de IA
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex-1 min-w-0">
              <label htmlFor="place" className="mb-1 block text-sm font-medium text-slate-700">
                Lugar
              </label>
              <input
                id="place"
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: Madrid, Panamá, Tokyo..."
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="model" className="mb-1 block text-sm font-medium text-slate-700">
                Modelo
              </label>
              <select
                id="model"
                value={selectModel}
                onChange={(e) => setSelectModel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {model.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={charging || !place.trim()}
              className="rounded-lg bg-sky-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {charging ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </section>

        {charging && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-slate-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            <span>Cargando datos...</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <p className="font-medium">Error</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {!charging && data && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-slate-700">Respuesta</p>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              {data}
            </pre>
          </section>
        )}
      </div>
    </div>
  )
}

export default App
