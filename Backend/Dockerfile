FROM python:3.12-slim

# Evitar archivos .pyc y buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema si las necesitás (psycopg2, pillow, etc)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar requerimientos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Exponer el puerto donde correrá gunicorn
EXPOSE 8000

# Comando de ejecución (Gunicorn para producción)
CMD ["gunicorn", "project_name.wsgi:application", "--bind", "0.0.0.0:8000"]

