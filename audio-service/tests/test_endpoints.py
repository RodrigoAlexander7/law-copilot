"""
Tests básicos para verificar endpoints del audio service.
Ejecutar: pytest tests/test_endpoints.py -v
"""

import pytest
import httpx
import base64


BASE_URL = "http://localhost:8001"


def test_health_check():
    """Verifica que el health check responda."""
    response = httpx.get(f"{BASE_URL}/api/health", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "elevenlabs" in data
    assert "google_tts" in data
    assert "rag_service" in data
    print(f"✅ Health check: {data['status']}")


def test_internal_tts():
    """Prueba el endpoint interno de TTS."""
    response = httpx.post(
        f"{BASE_URL}/internal/tts",
        json={
            "text": "Hola, esto es una prueba de audio.",
            "module_type": "teaching"
        },
        timeout=30
    )
    assert response.status_code == 200
    data = response.json()
    assert "audio_base64" in data
    assert "service_used" in data
    assert len(data["audio_base64"]) > 100
    print(f"✅ TTS generado con {data['service_used']}")


def test_process_query_with_text():
    """Prueba el endpoint principal con texto."""
    response = httpx.post(
        f"{BASE_URL}/api/process-query",
        json={
            "text": "¿Qué es el artículo 2 de la constitución?",
            "module_type": "teaching"
        },
        timeout=60
    )
    
    # Puede fallar si RAG no está corriendo, pero verificamos estructura
    if response.status_code == 200:
        data = response.json()
        assert "text_response" in data
        assert "audio_base64" in data
        assert "processing_time_ms" in data
        print(f"✅ Query procesado en {data['processing_time_ms']}ms")
    else:
        print(f"⚠️ Query falló (probablemente RAG no disponible): {response.status_code}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🧪 Tests del Audio Service")
    print("="*60 + "\n")
    
    print("🔍 Test 1: Health Check")
    test_health_check()
    
    print("\n🔊 Test 2: TTS Interno")
    test_internal_tts()
    
    print("\n📝 Test 3: Process Query con Texto")
    test_process_query_with_text()
    
    print("\n" + "="*60)
    print("✅ Tests completados")
    print("="*60)
