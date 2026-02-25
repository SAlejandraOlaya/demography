import { useState, useEffect } from 'react'
import axios from 'axios'

const App = () => {
  const [model, setModel] = useState<string[]>([])
  const [selectModel, setSelectModel] = useState<string>('')
  const [place, setPlace] = useState('')
  const [data, setData] = useState(null)
  const [charging, setCharging] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:8000/models')
      .then((response: any) => {
        setModel(response.data.models)
        setSelectModel(response.data.models[0])
      })
      .catch((error: any) => {
        setError(error.message)

      })
  }, [])

  const handleSearch = () => {
    if (!place) {
      return;
    }
    setError(null);
    setData(null);
    setCharging(true)

    axios.get(`http://localhost:8000/demography/${place}?model=${selectModel}`)
      .then((response: any) => {
        setData(response.data.data);
      })
      .catch((error: any) => {
        setError(error.response?.data?.detail || error.message);

      })
      .finally(() => {
        setCharging(false);
      })
  };

  return (
    <div>
      <h1> APP DEMOGRAFIA</h1>
      <select value={selectModel} onChange={(e) => setSelectModel(e.target.value)}>
        {model.map((m) => <option key={m} value={m}>{m} </option>)}
      </select>
      <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder='Ingrese el lugar' />
      <button onClick={handleSearch}>  Buscar</button>

      {charging && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Datos: {data}</p>}

    </div>
  )
}

export default App;