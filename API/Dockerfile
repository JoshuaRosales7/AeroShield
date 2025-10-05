# Imagen base ligera con Python
FROM python:3.12-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements primero para aprovechar caché de Docker
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Exponer el puerto 8080 (obligatorio en Cloud Run)
ENV PORT=8080

# Comando para iniciar FastAPI con Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
