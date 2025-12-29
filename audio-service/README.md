# Audio Service - Legal Assistant

Microservicio de procesamiento de audio para el asistente legal. Maneja conversión de texto a audio (TTS), audio a texto (STT) y comunicación con el RAG service.

## 🎯 Características

- **Text-to-Speech (TTS)**: ElevenLabs + Google Cloud TTS con fallback automático
- **Speech-to-Text (STT)**: ElevenLabs + Google Cloud STT con fallback automático
- **Integración RAG**: Comunicación con backend de LangChain
- **Multi-módulo**: Soporte para Teaching, Simulation y Advisor
- **Health Checks**: Monitoreo de todos los servicios

## 📁 Estructura

```
audio-service/
├── src/
│   ├── api/
│   │   ├── main.py       # FastAPI app
│   │   ├── routes.py     # Endpoints
│   │   └── schemas.py    # Pydantic models
│   ├── services/
│   │   ├── elevenlabs_service.py
│   │   ├── google_tts_service.py
│   │   ├── google_stt_service.py
│   │   └── rag_client.py
│   └── core/
│       └── config.py     # Configuración
├── tests/
│   └── test_endpoints.py
└── requirements.txt
```

## 🚀 Setup

### 1. Instalar dependencias

```bash
cd audio-service
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Editar `.env`:

```env
# ElevenLabs
ELEVENLABS_API_KEY=tu_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_TTS_VOICE_NAME=es-US-Neural2-A
GOOGLE_TTS_LANGUAGE_CODE=es-US

# RAG Service
RAG_SERVICE_URL=http://localhost:8000
RAG_SERVICE_TIMEOUT=30

# Server
PORT=8001

# MOCK MODE - Para testing sin RAG (cambiar a true)
MOCK_RAG=false
```

**⚠️ Modo Testing sin RAG:**
Si no tienes el RAG backend corriendo, puedes activar el modo mock:
```env
MOCK_RAG=true
```
Esto generará respuestas simuladas sin necesidad del backend RAG.

### 3. Colocar credenciales de Google Cloud

Descargar `google-credentials.json` y colocarlo en la raíz del proyecto.

### 4. Iniciar el servicio

```bash
python -m src.api.main
```

O con uvicorn:

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8001 --reload
```

## 📡 Endpoints

### Público (Frontend)

#### POST `/api/process-query`
Procesa consulta del usuario (texto o audio) y devuelve respuesta en audio + texto.

**Request (Text):**
```json
{
  "text": "¿Qué dice el artículo 2?",
  "audio_base64": null,
  "module_type": "teaching"
}
```

**Request (Audio in Base64):**
```json
{
  "text": null,
  "audio_base64": "UklGR...",
  "module_type": "teaching"
}
```

**Response:**
```json
{
  "text_response": "El artículo 2 establece...",
  "audio_base64": "UklGR...",
  "service_used": "google",
  "processing_time_ms": 1234
}
```

#### GET `/api/health`
Verifica estado de todos los servicios.

**Response:**
```json
{
  "status": "healthy",
  "elevenlabs": "connected",
  "google_tts": "connected",
  "google_stt": "connected",
  "rag_service": "connected",
  "timestamp": "2025-12-28T..."
}
```

### Interno (RAG/Debugging)

#### POST `/internal/tts`
Convierte texto a audio (solo TTS).

#### POST `/internal/stt`
Convierte audio a texto (solo STT).

## 🧪 Testing

### Ejecutar tests

```bash
# Con pytest
pytest tests/test_endpoints.py -v

# O directamente con Python
python tests/test_endpoints.py
```

### Test manual con curl

```bash
# Health check
curl http://localhost:8001/api/health

# Process query con texto
curl -X POST http://localhost:8001/api/process-query \
  -H "Content-Type: application/json" \
  -d '{
    "text": "¿Qué es el artículo 2?",
    "module_type": "teaching"
  }'
```

## 🔧 Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS not configured"
- Verificar que `.env` tenga la ruta correcta
- Asegurar que `google-credentials.json` exista

### Error: "RAG service timeout"
- Verificar que el RAG service esté corriendo en puerto 8000
- Ajustar `RAG_SERVICE_TIMEOUT` en `.env`

### Error: "ElevenLabs API error: 401"
- Verificar que `ELEVENLABS_API_KEY` sea válida
- El fallback a Google TTS debería activarse automáticamente

## 📊 Flujo de Datos

```
Frontend → Audio Service → RAG Service
                ↓
         [STT si es audio]
                ↓
         [Consulta a RAG]
                ↓
         [TTS de respuesta]
                ↓
         Frontend (audio + texto)
```

## 🎤 Módulos Soportados

- **Teaching**: Enseñanza legal con Google TTS
- **Simulation**: Simulación de corte con ElevenLabs TTS (fallback Google)
- **Advisor**: Asesor legal con Google TTS

## 📝 Documentación Interactiva

Una vez iniciado el servicio:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc
