<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/aeroshield-banner.png" alt="AeroShield Banner" width="100%">
</p>

<h1 align="center">🛰️ AeroShield</h1>

<p align="center">
  <strong>Plataforma integral de monitoreo ambiental y gestión de riesgos impulsada por IA</strong><br>
  <em>Combina datos satelitales, sensores locales e inteligencia artificial para detectar y prevenir desastres naturales.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/Firebase-Backend-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/FastAPI-API%20Server-teal?logo=fastapi" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/status-active-success" />
</p>

---

## 🌍 Descripción General

**AeroShield** es una plataforma de **monitoreo ambiental inteligente** que recopila datos desde satélites, sensores IoT y fuentes meteorológicas globales, aplicando **modelos de inteligencia artificial** para detectar riesgos y generar alertas tempranas.

Proporciona a comunidades e instituciones información ambiental en tiempo real sobre **calidad del aire, actividad sísmica, volcánica, incendios y condiciones meteorológicas**, optimizando los tiempos de respuesta ante emergencias.

---

## 🧠 Características Principales

### 🌫️ Calidad del Aire
- Monitoreo en tiempo real de NO₂, PM₂.₅, PM₁₀, O₃, CO.  
- Predicciones basadas en IA con reportes diarios, semanales y mensuales.

### 🌋 Actividad Volcánica
- Seguimiento de emisiones, plumas y sismicidad.  
- Integración con **Smithsonian GVP** y **NASA EONET**.

### 🌪️ Sismos e Incendios
- Detección de sismos desde **USGS**.  
- Visualización de incendios activos vía **NASA FIRMS**.

### 🌦️ Meteorología
- Datos de temperatura, presión, viento, visibilidad y precipitación.  
- Pronósticos mediante **Meteomatics API** con análisis predictivo de IA.

### 🚨 Alertas Inteligentes
- Generación automática de alertas con IA y validación humana.  
- Notificaciones en **Telegram**, **push**, y **correo electrónico**.  
- Clasificación por severidad: bajo, medio, alto, crítico.  
- Registro en **Firestore** y envío con **Firebase Cloud Messaging (FCM)**.

---

## ⚙️ Arquitectura del Sistema

### 🔸 Frontend
- **Framework:** Next.js 14 (TypeScript)  
- **UI:** TailwindCSS + ShadCN UI + Leaflet / Mapbox GL  
- **Autenticación:** Firebase Auth + JWT  
- **Idiomas:** Español / Inglés  
- **Despliegue:** Firebase Hosting + Vercel  

### 🔸 Backend
- **Servidor:** FastAPI + Firebase Functions  
- **Base de Datos:** PostgreSQL + PostGIS  
- **ORM:** Prisma  
- **IA / ML:** Modelos predictivos (TensorFlow, scikit-learn)  
- **Integraciones externas:** NASA, USGS, FIRMS, Smithsonian, OpenWeather, Meteomatics  

### 🔸 Infraestructura
- **Logs y monitoreo:** Google Cloud Logging + Sentry  
- **CI/CD:** GitHub Actions con despliegue automático  
- **Contenedores:** Docker + Docker Compose  

---

## ⚙️ API REST – FastAPI

El backend de **AeroShield** incluye una **API ambiental inteligente** desarrollada con **FastAPI**, que centraliza y procesa los datos ambientales mediante IA, generando y enviando alertas automáticas a través de Firebase.

### 📡 Endpoints Principales

| Endpoint | Método | Descripción |
|-----------|---------|-------------|
| `/` | GET | Información general de la API |
| `/dashboard/summary` | GET | Resumen ambiental con KPIs, AQI, clima y alertas |
| `/environment/full` | GET | Datos ambientales completos (aire, clima, volcanes, sismos, viento) |
| `/weather/current` | GET | Clima actual por coordenadas |
| `/weather/forecast` | GET | Pronóstico de 1 a 7 días |
| `/weather/cities` | GET | Clima actual de las principales ciudades de Guatemala |
| `/alerts/check` | GET | Genera y envía alertas automáticas |
| `/alerts/send-test` | POST | Envía una alerta de prueba |
| `/alerts/history` | GET | Historial de alertas guardadas en Firestore |
| `/alerts/stats` | GET | Estadísticas de alertas por tipo, severidad y estado |
| `/pollutants/{pollutant}` | GET | Datos de un contaminante específico |
| `/cities/pollution` | GET | Contaminación por ciudad |
| `/health` | GET | Estado del sistema y conexión a Firebase |

---

### 🧠 Funcionalidades de la API

#### 🔥 Sistema de Alertas Inteligente
- Envío automático de alertas basadas en IA.  
- Notificaciones en tiempo real vía Firebase Cloud Messaging (FCM).  
- Registro de estadísticas y logs en Firestore.  

#### 🌫️ Calidad del Aire (OpenAQ + IA)
- Cálculo de **AQI (Air Quality Index)** en tiempo real.  
- Evaluación por ciudad o zona geográfica.  
- Soporte para contaminantes: NO₂, PM₂.₅, O₃, HCHO.  

#### 🌋 Monitoreo Geofísico
- **USGS:** detección de sismos recientes y magnitud.  
- **NASA EONET:** actividad volcánica activa o moderada.  

#### 🌦️ Meteorología (Meteomatics)
- Datos de temperatura, humedad, presión, visibilidad y radiación UV.  
- Pronóstico de 3 a 7 días.  
- IA para predicción de lluvias intensas o vientos fuertes.  

---

### 📊 Ejemplo de Respuesta: `/dashboard/summary`

```json
{
  "timestamp": "2025-10-05T12:00:00Z",
  "center": { "name": "Guatemala", "lat": 14.63, "lon": -90.50 },
  "weather": { "temperature": 24.8, "humidity": 68, "source": "Meteomatics" },
  "metrics": {
    "aqi": 92,
    "aqi_category": { "category": "Moderada", "color": "yellow" },
    "pm25_avg_ugm3": 35.2,
    "temperature": 24.8,
    "humidity": 68
  },
  "alerts_recent": [
    {
      "severity": "medium",
      "title": "Lluvia intensa",
      "description": "Precipitación intensa detectada"
    }
  ]
}
