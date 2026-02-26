
export interface ModelsResponse {
  models: string[]
}

export interface DemographyResponse {
  place: string
  model: string
  data: string
}

export interface DemographyData {
  demografia: {
    poblacion_total: number
    densidad_poblacional: number
    tasa_natalidad: number
    tasa_mortalidad: number
    esperanza_vida: number
  }
  distribucion_edad: {
    [key: string]: number
  }
  idiomas: {
    oficial: string
    hablados: string[]
  }
  religiones: {
    [key: string]: number
  }
  datos_economicos: {
    [key: string]: string | number
  }
}
