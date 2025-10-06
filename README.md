<p align="center">
  <img src="https://raw.githubusercontent.com/JoshuaRosales7/AeroShield/refs/heads/main/IMG-20251005-WA0023.jpg" alt="AeroShield Banner" width="100%">
</p>

<p align="center">
  <strong>Intelligent Environmental Monitoring and Risk Management Platform powered by AI</strong><br>
  <em>Integrating satellite data, local sensors, and artificial intelligence to detect and prevent natural disasters.</em>
</p>

<p align="center">
  <a href="https://aeroshield.earth" target="_blank"><img src="https://img.shields.io/badge/🌍 Visit%20Platform-aeroshield.earth-blue?style=for-the-badge"></a><br><br>
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/Firebase-Backend-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/FastAPI-API%20Server-teal?logo=fastapi" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/status-active-success" />
</p>

---

## 🌍 Overview

**[AeroShield](https://aeroshield.earth)** is an **AI-powered environmental monitoring and risk management platform** that merges data from satellites, IoT sensors, and meteorological services to detect and predict natural disasters in real time.

The system uses **machine learning and predictive models** to analyze environmental conditions, providing early alerts for air pollution, wildfires, earthquakes, and severe weather events.

---

## 🧠 Key Features

### 🌫️ Air Quality
- Real-time monitoring of **NO₂, PM₂.₅, PM₁₀, O₃, CO** and other pollutants.  
- AI-generated forecasts (daily, weekly, and monthly).  
- Health impact categorization and visual alerts.

### 🌋 Volcanic Activity
- Tracking volcanic emissions and seismic signals.  
- Data sources: **Smithsonian GVP** and **NASA EONET**.  
- AI-based anomaly detection.

### 🌪️ Earthquakes & Wildfires
- Real-time seismic data via **USGS**.  
- Active fire detection using **NASA FIRMS**.  
- Smart correlation between events and risk zones.

### 🌦️ Meteorology
- Real-time temperature, pressure, wind, visibility, and precipitation.  
- AI-enhanced predictions through **Meteomatics API**.  
- Multi-layer weather map with historical replay.

### 🚨 Smart Alert System
- AI-based automatic alerts with human validation.  
- Notifications via **Telegram**, **push**, and **email**.  
- Severity classification: low, medium, high, critical.  
- Logging and delivery via **Firestore + Firebase Cloud Messaging (FCM)**.

---

## ⚙️ System Architecture

### 🔸 Frontend
- **Framework:** Next.js 14 (TypeScript)  
- **UI:** TailwindCSS + ShadCN UI + Leaflet / Mapbox GL  
- **Auth:** Firebase Auth + JWT  
- **Languages:** English / Spanish  
- **Deployment:** Firebase Hosting + Vercel  
- **URL:** 👉 [https://aeroshield.earth](https://aeroshield.earth)

### 🔸 Backend
- **Server:** FastAPI + Firebase Functions  
- **Database:** PostgreSQL + PostGIS  
- **ORM:** Prisma  
- **AI / ML:** TensorFlow + scikit-learn  
- **Integrations:** NASA, USGS, FIRMS, Smithsonian, OpenWeather, Meteomatics  
- **API Docs:** [https://api.aeroshield.earth/docs](https://nasa-gt-api-248654985571.us-central1.run.app/docs) *(si aplica)*

### 🔸 Infrastructure
- **Monitoring:** Google Cloud Logging + Sentry  
- **CI/CD:** GitHub Actions  
- **Containers:** Docker + Docker Compose  

---

## ⚙️ REST API – FastAPI

The **AeroShield API** centralizes environmental data, processes it with AI models, and manages automatic alert distribution via Firebase.

### 📡 Main Endpoints

| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/` | GET | API overview |
| `/dashboard/summary` | GET | Environmental summary (KPI, AQI, weather, alerts) |
| `/environment/full` | GET | Complete data (air, weather, volcanoes, earthquakes, wind) |
| `/weather/current` | GET | Current weather by coordinates |
| `/weather/forecast` | GET | Forecast 1–7 days |
| `/weather/cities` | GET | Weather for Guatemalan cities |
| `/alerts/check` | GET | Generate automatic alerts |
| `/alerts/send-test` | POST | Send a test alert |
| `/alerts/history` | GET | Retrieve alert history |
| `/alerts/stats` | GET | Alert statistics |
| `/pollutants/{pollutant}` | GET | Pollutant-specific data |
| `/cities/pollution` | GET | Pollution by city |
| `/health` | GET | System & Firebase connection status |

---

### 🧠 AI & Data Capabilities

#### 🔥 Smart Alert System
- AI-based automatic alerts with multi-channel notifications.  
- Real-time statistics and logging in Firestore.  

#### 🌫️ Air Quality (OpenAQ + AI)
- Real-time AQI computation and predictions.  
- Pollution level categorization by city or region.  

#### 🌋 Geophysical Monitoring
- Earthquake tracking (USGS).  
- Volcanic activity updates (NASA EONET + GVP).  

#### 🌦️ Meteorology (Meteomatics)
- Temperature, humidity, wind, and UV index data.  
- AI-based extreme weather detection.

---

## 📊 Example Response: `/dashboard/summary`

```json
{
  "timestamp": "2025-10-05T12:00:00Z",
  "center": { "name": "Guatemala", "lat": 14.63, "lon": -90.50 },
  "weather": { "temperature": 24.8, "humidity": 68, "source": "Meteomatics" },
  "metrics": {
    "aqi": 92,
    "aqi_category": { "category": "Moderate", "color": "yellow" },
    "pm25_avg_ugm3": 35.2,
    "temperature": 24.8,
    "humidity": 68
  },
  "alerts_recent": [
    {
      "severity": "medium",
      "title": "Heavy Rain Detected",
      "description": "Intense precipitation detected in monitored area"
    }
  ]
}





