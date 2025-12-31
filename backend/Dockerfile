FROM python:3.12-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar requirements primero (para cachear dependencias)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Puerto por defecto (Cloud Run inyecta PORT)
EXPOSE 8080

# Comando para ejecutar la app (lee PORT del entorno, default 8080)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]