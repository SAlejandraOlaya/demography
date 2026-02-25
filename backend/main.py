from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from litellm.exceptions import (
    AuthenticationError,
    BadGatewayError,
    NotFoundError,
    RateLimitError,
    ServiceUnavailableError,
    Timeout,
)

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)



available_models = {
    "llama3": "groq/llama-3.3-70b-versatile",
    "llama3-8b": "groq/llama-3.1-8b-instant",
    "cerebras-gpt120b": "cerebras/gpt-oss-120b",
    "cerebras-llama8b": "cerebras/llama3.1-8b",
    "samba-deepseek": "sambanova/DeepSeek-V3-0324",
    "samba-llama": "sambanova/Meta-Llama-3.3-70B-Instruct",
}

@app.get("/models")
def get_models():
    return {"models":list(available_models.keys())}

@app.get("/demography/{place}")
def get_demography(place: str, model: str = "llama3"):
    if model not in available_models:
        raise HTTPException(
            status_code=400,
            detail=f"Modelo '{model}' no válido. Usa uno de: {list(available_models.keys())}",
        )
    selected_model = available_models[model]
    try:
        kwargs = {
            "model": selected_model,
            "messages": [{
                "role": "user",
                "content": f"Dame información demográfica detallada sobre {place}. Incluye: población total, densidad poblacional, tasa de natalidad, tasa de mortalidad, esperanza de vida, distribución por edades, idiomas, religiones y datos económicos básicos. Responde en formato JSON estructurado.",
            }],
        }
        response = completion(**kwargs)
        return {
            "place": place,
            "model": model,
            "data": response.choices[0].message.content,
        }
    except RateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail="Cuota del modelo agotada. Intenta más tarde o usa otro modelo (ej: llama3, mixtral).",
        ) from e
    except AuthenticationError as e:
        raise HTTPException(
            status_code=401,
            detail="Error de autenticación con el proveedor del modelo. Revisa tus API keys en .env.",
        ) from e
    except NotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"Modelo no encontrado: {model}.",
        ) from e
    except Timeout as e:
        raise HTTPException(
            status_code=504,
            detail="El servicio del modelo tardó demasiado en responder. Intenta de nuevo.",
        ) from e
    except (BadGatewayError, ServiceUnavailableError) as e:
        raise HTTPException(
            status_code=503,
            detail="El proveedor del modelo no está disponible. Intenta más tarde.",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al llamar al modelo: {str(e)}",
        ) from e

