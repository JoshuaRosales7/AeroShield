# main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any, Tuple
import aiohttp
import asyncio
import os
from datetime import datetime, timedelta
import math
import random
import logging
from cachetools import TTLCache
import base64
import firebase_admin
from firebase_admin import credentials, messaging, firestore
import json

# =========================
# Configuración base
# =========================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nasa-gt-api")

app = FastAPI(
    title="NASA Guatemala Environmental API",
    description="NASA API for air quality, earthquakes, volcanoes, and weather in Guatemala",
    version="4.1.0",
)

# 🌐 Permitir dominios de tu frontend
origins = [
    "https://aeroshieldgt.web.app",  # Tu dominio en Firebase Hosting
    "https://aeroshieldgt.firebaseapp.com",  # Dominio alternativo de Firebase
    "http://localhost:3000",  # Para desarrollo local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],            # permite GET, POST, PUT, DELETE...
    allow_headers=["*"],            # permite cualquier cabecera
)

cache = TTLCache(maxsize=100, ttl=300)  # 5 min

# Configuración de APIs
NASA_API_KEY = "DEMO_KEY"
OPENAQ_API_BASE = "https://api.openaq.org/v2"
METEOMATICS_USERNAME = "rosales_joshua"
METEOMATICS_PASSWORD = "k4i7bq552LUPPGDF9wkE"
METEOMATICS_BASE = "https://api.meteomatics.com"
DEMO_MODE = True

# =========================
# Configuración Firebase - COMPLETA
# =========================

FIREBASE_CREDENTIALS = {
    "type": "service_account",
    "project_id": "aeroshieldgt",
    "private_key_id": "6be3eed1616d2e3cbd9580fb5393a595a5b11091",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSQB6tSR0tFU/G\npzUrBecY9N1DsqOmb3urQjYZb4NMuk8q+sSK/8gJSfAyQqrfRUuGxlvZ/gBX0qun\nJOV1VGYP7ffuaZNwonYbRGRpvVtxRrE1om638P5yOAGUFbS3o6tG8V8t77Y+FsYv\nEe8l/XjqrolOJhfjLeGedwlgielB1nabDA51au2Tgv7ymMI2b+Zn/XztpThsQ25d\nVS/fKbRtyskAik+h/ROW+YqjzhRzHlXZx/7wxWXF32EK/Q0qA2+xgmgH6PoeImg+\nybSY1vkTrTOM5HBqWZy4nKidaNd2BN6gpIFIN/Rmun22thWeaDLbdX4gLvVVAS6V\nhxwv2GOjAgMBAAECggEAAeT5gMDSn57gluYqWTjvlRmjNBlKIlCNh2SJZtzKnk35\nDhg9K4SwX0SVnIwiYAjIhkksG7mLzSFGZhkZfB2/JLPVqC2PJ14L/K8MktqviSmj\nagHUBVN8mr7FvxPHq844K0rG9+y+/DRyZMB3Bwm4lHt+6foU9b8o3LWMLsdVoFMj\n/mTfQKQJaXfly6MJedqH1LD8AcyLJvJnMkWVW0q3w6MvgfIbdq7jhllV0/YKkRnx\n2W1P8qDNPiFaKF7oFA+Lpp2a7WLuAG6A+jVzWGobYgmJ+Lz6i/EL/29smMfnfoKw\njOi2Bg7A2W1zJ+HvlQ2UOVxyYthWvcpCskh4nfEQwQKBgQDKv9ZtLVuvVIxXQ0fu\nZDm2AIooPNYtSXZ3q5c71gp8+M16qMAjTlVwJI2jsoztbZtqzL+FvDlJ6u1X15Oc\nmmPSrjgc9hw9FBVFG9pUzHr0s0uMzGgR0I8FNAkThFn1vqYPHAySuLAwwhNTWn2C\nP7hdD0SjzAPdmeS1y+89mmUW6QKBgQC4qX4oM6zTjPlKHC63n6QBUTbO+t9dl4Wd\nCztrvt6km1lUlvRuJyZemML52elbDiwDvHfeFTzQjkNS0XqQDIknK7ziVqUGQWK5\n4uwHdYlbvROFlvSPIRrfARXwVrQNhqXj9Zld/5GO4q8P4p5uj1QN+aPMt46L0LT1\nyySuWV+mqwKBgFsx6pr0+fZlCzL8+k/KGQM6PupWYue/0V+GeOHbJqCLsLDpUnMO\n+vMUHflxiF4LHQruyX636PTMjLEkMCsSbrAG2Qp90LnQXLjXDF90EiIau3K7Rlws\n+QeYHjT/JQ+aD0tgjG86T1W/Fb46R5XcX2rMQU2DqIF2hR8YeaW12p5xAoGARshp\nXD2alKin8dllqusdcYfQ63vMXNK026KvjzhlnVES59LJNOP62C3UJvN5eHaxNmlq\nxQz897BgbAFx6n9znzkruNKfhQtRLZGnCaDrGugZ8I4Rhj+ZTjvbTfneIIUpV30P\n4bER+WQ42Gz0b8qu3ICBYfpGQJ+qjcDleZM2j+sCgYEAnBiCx4s01L8Y/N4Oqpks\no0S+6PHQLPgvYKQ4RhaUJVpyE5Ltkt1u0zKQub388BMWMSxe+9j5X3bpShzezlKi\n4Uy42JFO9cDV46zA9IRZShyWE0WhTc9TxX02496S9cV/BJrrmwIHy5sPhFY6NvKM\n6tY0rjvRsUjN4jIkyFnQLS4=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@aeroshieldgt.iam.gserviceaccount.com",
    "client_id": "102052492714694997880",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40aeroshieldgt.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

FIREBASE_TOPIC = "guatemala_alerts"

# =========================
# Inicializar Firebase y Firestore
# =========================
firebase_app = None
firestore_db = None
FIREBASE_ENABLED = True

if FIREBASE_ENABLED:
    try:
        FIREBASE_CREDENTIALS["private_key"] = FIREBASE_CREDENTIALS["private_key"].replace("\\n", "\n")
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_app = firebase_admin.initialize_app(cred)
        
        # 🔥 INICIALIZAR FIRESTORE
        firestore_db = firestore.client()
        
        logger.info("✅ Firebase y Firestore inicializados correctamente")

    except Exception as e:
        logger.error(f"❌ Error inicializando Firebase/Firestore: {e}")
        firebase_app = None
        firestore_db = None
else:
    logger.info("🔶 Firebase deshabilitado - Modo desarrollo activo")
    firebase_app = None
    firestore_db = None

# BBOX Guatemala [minLon, minLat, maxLon, maxLat]
GUATEMALA_BBOX = [-92.3, 13.5, -88.0, 17.8]
CENTER_GT = {"name": "Guatemala", "lat": 14.6349, "lon": -90.5069, "bbox": GUATEMALA_BBOX}
GUATEMALA_CITIES = [
    {"name": "Ciudad de Guatemala", "lat": 14.6349, "lon": -90.5069, "population": 3000000},
    {"name": "Quetzaltenango", "lat": 14.8333, "lon": -91.5167, "population": 792530},
    {"name": "Escuintla", "lat": 14.3000, "lon": -90.7858, "population": 565000},
    {"name": "Antigua Guatemala", "lat": 14.561, "lon": -90.734, "population": 45000},
    {"name": "Huehuetenango", "lat": 15.3167, "lon": -91.4833, "population": 150000},
]

# =========================
# Modelos de Alertas
# =========================
class AlertType:
    AIR_QUALITY = "air_quality"
    EARTHQUAKE = "earthquake"
    VOLCANO = "volcano"
    WEATHER = "weather"
    FLOOD = "flood"
    LANDSLIDE = "landslide"

class AlertSeverity:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    SEVERE = "severe"

# =========================
# Servicio de Notificaciones MEJORADO con Firestore
# =========================
class FirebaseNotificationService:
    def __init__(self):
        self.enabled = firebase_app is not None
        self.firestore_enabled = firestore_db is not None
    
    async def save_alert_to_firestore(self, alert_data: Dict[str, Any]) -> str:
        """
        Guarda la alerta en Firestore y retorna el ID del documento
        """
        if not self.firestore_enabled:
            logger.warning("Firestore no configurado - alerta no guardada")
            return None
        
        try:
            # Preparar datos para Firestore
            alert_doc = {
                **alert_data,
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
                "status": "sent",
                "read": False,
                "delivered": False
            }
            
            # Guardar en la colección 'alerts'
            doc_ref = firestore_db.collection('alerts').document()
            doc_ref.set(alert_doc)
            
            logger.info(f"✅ Alerta guardada en Firestore: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            logger.error(f"❌ Error guardando alerta en Firestore: {e}")
            return None
    
    async def update_alert_status(self, alert_id: str, status: str, delivered: bool = False):
        """
        Actualiza el estado de una alerta en Firestore
        """
        if not self.firestore_enabled:
            return False
        
        try:
            doc_ref = firestore_db.collection('alerts').document(alert_id)
            doc_ref.update({
                "status": status,
                "delivered": delivered,
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            logger.error(f"❌ Error actualizando alerta {alert_id}: {e}")
            return False
    
    async def get_recent_alerts(self, limit: int = 50, alert_type: str = None) -> List[Dict[str, Any]]:
        """
        Obtiene alertas recientes desde Firestore
        """
        if not self.firestore_enabled:
            return []
        
        try:
            alerts_ref = firestore_db.collection('alerts')
            
            # Aplicar filtro por tipo si se especifica
            if alert_type:
                alerts_ref = alerts_ref.where('type', '==', alert_type)
            
            docs = alerts_ref.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit).stream()
            
            alerts = []
            for doc in docs:
                alert_data = doc.to_dict()
                alert_data["id"] = doc.id
                
                # Convertir timestamps de Firestore
                for time_field in ["created_at", "updated_at"]:
                    if time_field in alert_data and alert_data[time_field]:
                        if hasattr(alert_data[time_field], 'isoformat'):
                            alert_data[time_field] = alert_data[time_field].isoformat()
                        elif isinstance(alert_data[time_field], str):
                            # Ya es string, mantener igual
                            pass
                        else:
                            alert_data[time_field] = str(alert_data[time_field])
                
                alerts.append(alert_data)
            
            return alerts
            
        except Exception as e:
            logger.error(f"❌ Error obteniendo alertas de Firestore: {e}")
            return []
    
    async def send_alert_notification(self, alert_data: Dict[str, Any]) -> bool:
        """
        Envía notificación push Y guarda en Firestore
        """
        if not self.enabled:
            logger.warning("Firebase no configurado - notificación no enviada")
            return False
        
        try:
            # 1. GUARDAR EN FIRESTORE PRIMERO
            alert_id = await self.save_alert_to_firestore(alert_data)
            if not alert_id:
                logger.error("❌ No se pudo guardar alerta en Firestore")
                return False
            
            # 2. ENVIAR NOTIFICACIÓN PUSH
            title = alert_data.get("title", "Alerta Ambiental")
            body = alert_data.get("description", "")
            alert_type = alert_data.get("type", "general")
            severity = alert_data.get("severity", "medium")
            
            severity_emojis = {
                "low": "ℹ️",
                "medium": "⚠️",
                "high": "🚨",
                "severe": "🔥"
            }
            emoji = severity_emojis.get(severity, "⚠️")
            
            message = messaging.Message(
                notification=messaging.Notification(
                    title=f"{emoji} {title}",
                    body=body,
                ),
                data={
                    "alert_type": alert_type,
                    "severity": severity,
                    "timestamp": alert_data.get("timestamp", datetime.utcnow().isoformat()),
                    "location": alert_data.get("location", "Guatemala"),
                    "latitude": str(alert_data.get("latitude", CENTER_GT["lat"])),
                    "longitude": str(alert_data.get("longitude", CENTER_GT["lon"])),
                    "details": json.dumps(alert_data.get("details", {})),
                    "alert_id": alert_id  # Incluir ID de Firestore
                },
                topic=FIREBASE_TOPIC,
                android=messaging.AndroidConfig(
                    priority="high",
                    notification=messaging.AndroidNotification(
                        color="#ff0000",
                        sound="default",
                        tag="environment_alert"
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound="default",
                            badge=1,
                            thread_id="environment_alerts"
                        )
                    )
                )
            )
            
            response = messaging.send(message)
            
            # 3. ACTUALIZAR ALERTA CON ID DE FCM
            await self.update_alert_status(alert_id, "sent", True)
            alert_data["fcm_message_id"] = response
            alert_data["firestore_id"] = alert_id
            
            logger.info(f"✅ Notificación enviada y guardada: {response} - {title} (ID: {alert_id})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error enviando notificación FCM: {e}")
            # Marcar como error en Firestore
            if 'alert_id' in locals():
                await self.update_alert_status(alert_id, "error", False)
            return False

    async def send_multicast_notification(self, alert_data: Dict[str, Any], tokens: List[str]) -> bool:
        """
        Envía notificación a dispositivos específicos
        """
        if not self.enabled or not tokens:
            return False
        
        try:
            # Guardar primero en Firestore
            alert_id = await self.save_alert_to_firestore(alert_data)
            
            title = alert_data.get("title", "Alerta Ambiental")
            body = alert_data.get("description", "")
            
            message = messaging.MulticastMessage(
                tokens=tokens,
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data={
                    "alert_type": alert_data.get("type", "general"),
                    "severity": alert_data.get("severity", "medium"),
                    "timestamp": alert_data.get("timestamp", datetime.utcnow().isoformat()),
                    "alert_id": alert_id
                },
                android=messaging.AndroidConfig(priority="high"),
            )
            
            response = messaging.send_multicast(message)
            
            # Actualizar estado
            await self.update_alert_status(alert_id, "sent", response.success_count > 0)
            
            logger.info(f"✅ Notificación multicast enviada: {response.success_count} éxitos")
            return response.success_count > 0
            
        except Exception as e:
            logger.error(f"❌ Error enviando notificación multicast: {e}")
            return False

# Instancia global del servicio de notificaciones
notification_service = FirebaseNotificationService()

# =========================
# Sistema de Gestión de Alertas MEJORADO
# =========================
class AlertManager:
    def __init__(self):
        self.sent_alerts = TTLCache(maxsize=1000, ttl=3600)  # Cache de 1 hora para evitar duplicados
    
    def _get_alert_key(self, alert_data: Dict[str, Any]) -> str:
        """Genera una clave única para evitar alertas duplicadas"""
        alert_type = alert_data.get("type", "general")
        location = alert_data.get("location", "unknown")
        severity = alert_data.get("severity", "medium")
        return f"{alert_type}_{location}_{severity}_{datetime.utcnow().strftime('%Y%m%d%H')}"
    
    async def check_air_quality_alerts(self, pollution_data: Dict[str, Any], location: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Verifica alertas de calidad del aire"""
        alerts = []
        pm25 = pollution_data.get("PM25", 0)
        no2 = pollution_data.get("NO2", 0)
        aqi = aqi_from_pm25(pm25)
        
        if aqi > 150:  # Insalubre
            alert = {
                "type": AlertType.AIR_QUALITY,
                "severity": AlertSeverity.HIGH if aqi <= 200 else AlertSeverity.SEVERE,
                "title": f"Calidad del Aire Peligrosa - AQI {aqi}",
                "description": f"La calidad del aire es {'INSALUBRE' if aqi <= 200 else 'MUY PELIGROSA'}. Se recomienda evitar actividades al aire libre.",
                "location": location.get("name", "Área afectada"),
                "latitude": location.get("lat"),
                "longitude": location.get("lon"),
                "timestamp": datetime.utcnow().isoformat(),
                "details": {
                    "aqi": aqi,
                    "pm25": pm25,
                    "no2": no2,
                    "category": get_aqi_category(aqi)["category"],
                    "recommendations": [
                        "Evitar actividades al aire libre",
                        "Usar mascarilla en exteriores",
                        "Mantener ventanas cerradas"
                    ]
                }
            }
            alerts.append(alert)
        
        elif no2 > 40:  # NO2 elevado
            alert = {
                "type": AlertType.AIR_QUALITY,
                "severity": AlertSeverity.MEDIUM,
                "title": "Niveles Elevados de NO2",
                "description": f"Concentración de dióxido de nitrógeno elevada: {no2:.1f} µg/m³",
                "location": location.get("name", "Área afectada"),
                "timestamp": datetime.utcnow().isoformat(),
                "details": {
                    "no2": no2, 
                    "unit": "µg/m³",
                    "recommendations": [
                        "Evitar zonas de alto tráfico",
                        "Ventilar espacios cerrados"
                    ]
                }
            }
            alerts.append(alert)
        
        return alerts
    
    async def check_earthquake_alerts(self, earthquakes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Verifica alertas de sismos"""
        alerts = []
        for quake in earthquakes:
            magnitude = quake.get("magnitude", 0)
            if magnitude >= 4.5:
                alert = {
                    "type": AlertType.EARTHQUAKE,
                    "severity": AlertSeverity.HIGH if magnitude < 6.0 else AlertSeverity.SEVERE,
                    "title": f"Sismo Magnitud {magnitude}",
                    "description": f"Sismo detectado: {quake.get('place', 'Epicentro no especificado')}",
                    "location": "Región Sísmica",
                    "latitude": quake.get("lat"),
                    "longitude": quake.get("lon"),
                    "timestamp": datetime.utcnow().isoformat(),
                    "details": {
                        "magnitude": magnitude,
                        "depth": quake.get("depth"),
                        "location": quake.get("place"),
                        "time": quake.get("time"),
                        "recommendations": [
                            "Buscar un lugar seguro",
                            "Alejarse de ventanas y objetos pesados",
                            "Seguir instrucciones de autoridades"
                        ]
                    }
                }
                alerts.append(alert)
        
        return alerts
    
    async def check_volcano_alerts(self, volcanoes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Verifica alertas volcánicas"""
        alerts = []
        for volcano in volcanoes:
            status = volcano.get("status", "").lower()
            name = volcano.get("name", "")
            
            if "activo" in status or "erupción" in status:
                alert = {
                    "type": AlertType.VOLCANO,
                    "severity": AlertSeverity.HIGH,
                    "title": f"Actividad Volcánica - {name}",
                    "description": f"El volcán {name} muestra actividad. Manténgase informado.",
                    "location": name,
                    "latitude": volcano.get("lat"),
                    "longitude": volcano.get("lon"),
                    "timestamp": datetime.utcnow().isoformat(),
                    "details": {
                        "status": status,
                        "name": name,
                        "last_update": volcano.get("date"),
                        "recommendations": [
                            "Seguir instrucciones de autoridades",
                            "Tener plan de evacuación",
                            "Monitorear fuentes oficiales"
                        ]
                    }
                }
                alerts.append(alert)
        
        return alerts
    
    async def check_weather_alerts(self, weather_data: Dict[str, Any], location: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Verifica alertas meteorológicas"""
        alerts = []
        
        # Lluvia intensa
        precipitation = weather_data.get("precipitation", 0)
        if precipitation > 20:
            alert = {
                "type": AlertType.WEATHER,
                "severity": AlertSeverity.MEDIUM,
                "title": "Lluvia Intensa",
                "description": f"Precipitación intensa detectada: {precipitation} mm/h",
                "location": location.get("name", "Área afectada"),
                "timestamp": datetime.utcnow().isoformat(),
                "details": {
                    "precipitation": precipitation,
                    "unit": "mm/h",
                    "recommendations": [
                        "Evitar zonas inundables",
                        "Conducir con precaución",
                        "Monitorear niveles de ríos"
                    ]
                }
            }
            alerts.append(alert)
        
        # Vientos fuertes
        wind_speed = weather_data.get("wind_speed", 0)
        if wind_speed > 30:
            alert = {
                "type": AlertType.WEATHER,
                "severity": AlertSeverity.MEDIUM,
                "title": "Vientos Fuertes",
                "description": f"Vientos de {wind_speed} km/h detectados",
                "location": location.get("name", "Área afectada"),
                "timestamp": datetime.utcnow().isoformat(),
                "details": {
                    "wind_speed": wind_speed, 
                    "unit": "km/h",
                    "recommendations": [
                        "Asegurar objetos exteriores",
                        "Evitar zonas con árboles",
                        "Tener cuidado al conducir"
                    ]
                }
            }
            alerts.append(alert)
        
        # Alto índice UV
        uv_index = weather_data.get("uv_index", 0)
        if uv_index > 8:
            alert = {
                "type": AlertType.WEATHER,
                "severity": AlertSeverity.MEDIUM,
                "title": "Índice UV Muy Alto",
                "description": f"Índice UV extremo: {uv_index}. Use protección solar.",
                "location": location.get("name", "Área afectada"),
                "timestamp": datetime.utcnow().isoformat(),
                "details": {
                    "uv_index": uv_index,
                    "recommendations": [
                        "Usar protector solar FPS 50+",
                        "Usar gorra y gafas de sol",
                        "Evitar exposición 10am-4pm"
                    ]
                }
            }
            alerts.append(alert)
        
        return alerts
    
    async def process_and_send_alerts(self, environmental_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Procesa todos los datos ambientales y envía alertas necesarias"""
        all_alerts = []
        
        try:
            # Verificar calidad del aire
            pollution = generate_pollution_data()
            air_alerts = await self.check_air_quality_alerts(
                pollution, 
                {"name": "Guatemala", "lat": CENTER_GT["lat"], "lon": CENTER_GT["lon"]}
            )
            all_alerts.extend(air_alerts)
            
            # Verificar sismos
            earthquakes = environmental_data.get("earthquakes", [])
            quake_alerts = await self.check_earthquake_alerts(earthquakes)
            all_alerts.extend(quake_alerts)
            
            # Verificar volcanes
            volcanoes = environmental_data.get("volcanoes", [])
            volcano_alerts = await self.check_volcano_alerts(volcanoes)
            all_alerts.extend(volcano_alerts)
            
            # Verificar clima
            weather = environmental_data.get("weather", {})
            weather_alerts = await self.check_weather_alerts(
                weather,
                {"name": "Guatemala", "lat": CENTER_GT["lat"], "lon": CENTER_GT["lon"]}
            )
            all_alerts.extend(weather_alerts)
            
            # Enviar notificaciones para alertas nuevas
            sent_count = 0
            for alert in all_alerts:
                alert_key = self._get_alert_key(alert)
                if alert_key not in self.sent_alerts:
                    success = await notification_service.send_alert_notification(alert)
                    if success:
                        self.sent_alerts[alert_key] = True
                        sent_count += 1
                        logger.info(f"🚨 Alerta enviada: {alert['title']}")
            
            logger.info(f"📊 Resumen alertas: {len(all_alerts)} detectadas, {sent_count} enviadas")
            return all_alerts
            
        except Exception as e:
            logger.error(f"❌ Error procesando alertas: {e}")
            return []

# Instancia global del gestor de alertas
alert_manager = AlertManager()

# =========================
# Utilidades
# =========================
async def fetch_json(session: aiohttp.ClientSession, url: str, params: Optional[Dict[str, Any]] = None,
                     headers: Optional[Dict[str, str]] = None, timeout: int = 30) -> Dict[str, Any]:
    try:
        async with session.get(url, params=params, headers=headers, timeout=timeout) as res:
            if res.status != 200:
                text = await res.text()
                logger.warning(f"[{res.status}] {url} -> {text[:200]}")
                return {}
            return await res.json()
    except Exception as e:
        logger.error(f"fetch_json error: {url} -> {e}")
        return {}

def aqi_from_pm25(pm25_ugm3: float) -> int:
    table = [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ]
    for (clow, chigh, ilow, ihigh) in table:
        if clow <= pm25_ugm3 <= chigh:
            aqi = ((ihigh - ilow) / (chigh - clow)) * (pm25_ugm3 - clow) + ilow
            return round(aqi)
    return 500

def get_aqi_category(aqi: int) -> Dict[str, Any]:
    if aqi <= 50:
        return {"category": "Buena", "color": "green", "level": "low"}
    elif aqi <= 100:
        return {"category": "Moderada", "color": "yellow", "level": "moderate"}
    elif aqi <= 150:
        return {"category": "Insalubre para grupos sensibles", "color": "orange", "level": "high"}
    elif aqi <= 200:
        return {"category": "Insalubre", "color": "red", "level": "very_high"}
    else:
        return {"category": "Muy Insalubre", "color": "purple", "level": "severe"}

def in_bbox(lon: float, lat: float, bbox: List[float]) -> bool:
    return bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]

def get_meteomatics_auth_header() -> Optional[Dict[str, str]]:
    """Genera header de autenticación para Meteomatics"""
    if METEOMATICS_USERNAME and METEOMATICS_PASSWORD:
        credentials = f"{METEOMATICS_USERNAME}:{METEOMATICS_PASSWORD}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return {"Authorization": f"Basic {encoded}"}
    return None

# =========================
# Fallbacks simulados (solo si fallan fuentes)
# =========================
def generate_pollution_data() -> Dict[str, float]:
    hour = datetime.utcnow().hour
    traffic_factor = 0.8 + 0.4 * math.sin((hour - 8) * math.pi / 12)
    return {
        "NO2": max(8, 15 * traffic_factor * (0.9 + 0.2 * random.random())),
        "PM25": max(25, 45 * (0.8 + 0.4 * random.random())),
        "O3": max(20, 30 * (0.8 + 0.4 * random.random())),
        "HCHO": max(3, 7 * (0.8 + 0.4 * random.random())),
    }

def fallback_heatmap_points() -> List[Dict[str, Any]]:
    points = []
    for city in GUATEMALA_CITIES:
        intensity = min(1.0, 0.4 + (city["population"] / 3000000) * 0.5)
        points.append({"lat": city["lat"], "lon": city["lon"], "intensity": intensity, "city": city["name"]})
        for _ in range(3):
            lat_var = (random.random() - 0.5) * 0.1
            lon_var = (random.random() - 0.5) * 0.1
            points.append({
                "lat": city["lat"] + lat_var,
                "lon": city["lon"] + lon_var,
                "intensity": max(0.1, intensity * (0.6 + 0.4 * random.random())),
                "city": city["name"],
            })
    return points

# =========================
# Integraciones externas reales - METEOIMATICS
# =========================
async def get_weather_data_meteomatics(lat: float, lon: float) -> Dict[str, Any]:
    """
    Obtiene datos meteorológicos actuales desde Meteomatics
    """
    if not METEOMATICS_USERNAME or not METEOMATICS_PASSWORD:
        logger.warning("Credenciales de Meteomatics no configuradas, usando datos simulados")
        return generate_weather_fallback()
    
    now = datetime.utcnow()
    formatted_date = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Parámetros meteorológicos
    parameters = [
        "t_2m:C",  # Temperatura a 2m en Celsius
        "relative_humidity_2m:p",  # Humedad relativa
        "precip_1h:mm",  # Precipitación última hora
        "wind_speed_10m:ms",  # Velocidad del viento
        "wind_dir_10m:d",  # Dirección del viento
        "msl_pressure:hPa",  # Presión atmosférica
        "weather_symbol_1h:idx",  # Símbolo del tiempo
        "uv:idx",  # Índice UV
        "visibility:m"  # Visibilidad
    ]
    
    url = f"{METEOMATICS_BASE}/{formatted_date}/{','.join(parameters)}/{lat},{lon}/json"
    
    try:
        headers = get_meteomatics_auth_header()
        async with aiohttp.ClientSession() as session:
            data = await fetch_json(session, url, headers=headers)
        
        if not data or "data" not in data:
            return generate_weather_fallback()
            
        # Procesar datos
        weather_data = {}
        for item in data["data"]:
            parameter = item["parameter"]
            coordinates = item["coordinates"][0]
            value = coordinates["dates"][0]["value"]
            
            if parameter == "t_2m:C":
                weather_data["temperature"] = round(value, 1)
            elif parameter == "relative_humidity_2m:p":
                weather_data["humidity"] = round(value)
            elif parameter == "precip_1h:mm":
                weather_data["precipitation"] = round(value, 1)
            elif parameter == "wind_speed_10m:ms":
                weather_data["wind_speed"] = round(value * 3.6, 1)  # Convertir a km/h
            elif parameter == "wind_dir_10m:d":
                weather_data["wind_direction"] = round(value)
            elif parameter == "msl_pressure:hPa":
                weather_data["pressure"] = round(value, 1)
            elif parameter == "weather_symbol_1h:idx":
                weather_data["weather_code"] = int(value)
            elif parameter == "uv:idx":
                weather_data["uv_index"] = round(value, 1)
            elif parameter == "visibility:m":
                weather_data["visibility"] = round(value / 1000, 1)  # Convertir a km
        
        weather_data.update({
            "source": "Meteomatics",
            "last_updated": datetime.utcnow().isoformat(),
            "location": {"lat": lat, "lon": lon}
        })
        
        return weather_data
        
    except Exception as e:
        logger.error(f"Error obteniendo datos de Meteomatics: {e}")
        return generate_weather_fallback()

def generate_weather_fallback() -> Dict[str, Any]:
    """Genera datos meteorológicos de fallback"""
    hour = datetime.utcnow().hour
    # Variación diurna para temperatura
    base_temp = 22 + 8 * math.sin((hour - 6) * math.pi / 12)
    
    return {
        "temperature": round(base_temp + random.uniform(-2, 2), 1),
        "humidity": random.randint(40, 85),
        "precipitation": round(random.uniform(0, 5), 1),
        "wind_speed": round(random.uniform(0, 15), 1),
        "wind_direction": random.randint(0, 360),
        "pressure": round(1013 + random.uniform(-10, 10), 1),
        "weather_code": random.randint(1, 27),
        "uv_index": round(random.uniform(1, 12), 1),
        "visibility": round(random.uniform(5, 20), 1),
        "source": "simulated",
        "last_updated": datetime.utcnow().isoformat()
    }

async def get_weather_forecast_meteomatics(lat: float, lon: float, days: int = 3) -> List[Dict[str, Any]]:
    """
    Obtiene pronóstico meteorológico para los próximos días
    """
    if not METEOMATICS_USERNAME or not METEOMATICS_PASSWORD:
        return generate_forecast_fallback(days)
    
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=days)
    
    parameters = ["t_2m:C", "weather_symbol_1h:idx", "precip_1h:mm", "wind_speed_10m:ms"]
    url = f"{METEOMATICS_BASE}/{start_date.strftime('%Y-%m-%dT%H:%M:%SZ')}--{end_date.strftime('%Y-%m-%dT%H:%M:%SZ')}:P1D/{','.join(parameters)}/{lat},{lon}/json"
    
    try:
        headers = get_meteomatics_auth_header()
        async with aiohttp.ClientSession() as session:
            data = await fetch_json(session, url, headers=headers)
        
        if not data or "data" not in data:
            return generate_forecast_fallback(days)
            
        forecast = []
        for item in data["data"]:
            parameter = item["parameter"]
            coordinates = item["coordinates"][0]
            
            for date_info in coordinates["dates"]:
                date = datetime.fromisoformat(date_info["date"].replace("Z", "+00:00"))
                value = date_info["value"]
                
                # Encontrar o crear entrada para esta fecha
                existing = next((f for f in forecast if f["date"].date() == date.date()), None)
                if not existing:
                    existing = {
                        "date": date.isoformat(),
                        "temperature": None,
                        "weather_code": None,
                        "precipitation": None,
                        "wind_speed": None
                    }
                    forecast.append(existing)
                
                if parameter == "t_2m:C":
                    existing["temperature"] = round(value, 1)
                elif parameter == "weather_symbol_1h:idx":
                    existing["weather_code"] = int(value)
                elif parameter == "precip_1h:mm":
                    existing["precipitation"] = round(value, 1)
                elif parameter == "wind_speed_10m:ms":
                    existing["wind_speed"] = round(value * 3.6, 1)  # km/h
        
        return forecast[:days]  # Limitar al número de días solicitados
        
    except Exception as e:
        logger.error(f"Error obteniendo pronóstico de Meteomatics: {e}")
        return generate_forecast_fallback(days)

def generate_forecast_fallback(days: int) -> List[Dict[str, Any]]:
    """Genera pronóstico de fallback"""
    forecast = []
    base_temp = 22
    
    for i in range(days):
        date = datetime.utcnow() + timedelta(days=i)
        temp_variation = 4 * math.sin(i * math.pi / 7)  # Variación semanal
        forecast.append({
            "date": date.isoformat(),
            "temperature": round(base_temp + temp_variation + random.uniform(-3, 3), 1),
            "weather_code": random.randint(1, 27),
            "precipitation": round(random.uniform(0, 8), 1),
            "wind_speed": round(random.uniform(0, 20), 1),
            "source": "simulated"
        })
    
    return forecast

# =========================
# Funciones existentes mejoradas
# =========================
async def get_air_quality_and_stations_from_openaq(bbox: List[float]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Usa OpenAQ para obtener estaciones y medidas recientes (PM25/NO2) dentro del BBOX.
    Devuelve (air_points, stations).
    """
    min_lon, min_lat, max_lon, max_lat = bbox
    params = {
        "limit": 200,
        "page": 1,
        "offset": 0,
        "sort": "desc",
        "order_by": "lastUpdated",
        "entity": "government,community,research",
        "parameters": "pm25,no2",
        "coordinates": f"{(min_lat+max_lat)/2},{(min_lon+max_lon)/2}",
        "radius": 500000,  # 500 km alrededor del centro – para cubrir GT
        "country_id": "GT",
    }
    url = f"{OPENAQ_API_BASE}/latest"
    async with aiohttp.ClientSession() as session:
        data = await fetch_json(session, url, params=params)

    air_points: List[Dict[str, Any]] = []
    stations: List[Dict[str, Any]] = []
    if not data or "results" not in data:
        return air_points, stations

    for r in data["results"]:
        try:
            lat = r["coordinates"]["latitude"]
            lon = r["coordinates"]["longitude"]
            if not in_bbox(lon, lat, bbox):
                continue
            pm25_val = None
            no2_val = None
            for m in r.get("measurements", []):
                if m.get("parameter") == "pm25":
                    pm25_val = float(m.get("value"))
                if m.get("parameter") == "no2":
                    no2_val = float(m.get("value"))
            aqi = aqi_from_pm25(pm25_val) if pm25_val is not None else None
            intensity = None
            if aqi is not None:
                intensity = min(1.0, max(0.05, aqi / 200.0))
            air_points.append({
                "lat": lat, "lon": lon, "intensity": intensity if intensity else 0.4,
                "aqi": aqi, "pm25": pm25_val, "no2": no2_val, "station": r.get("location"),
                "source": "OpenAQ"
            })
            stations.append({
                "name": r.get("location"),
                "lat": lat, "lon": lon,
                "last_updated": r.get("measurements", [{}])[0].get("lastUpdated"),
                "source": "OpenAQ",
            })
        except Exception:
            continue

    return air_points, stations

async def get_air_quality_and_stations_from_openaq_global(limit: int = 500) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Usa OpenAQ para obtener estaciones y medidas recientes (PM25/NO2) a nivel mundial.
    Devuelve (air_points, stations).
    """
    url = f"{OPENAQ_API_BASE}/latest"
    params = {
        "limit": limit,
        "sort": "desc",
        "order_by": "lastUpdated",
        "entity": "government,community,research",
        "parameters": "pm25,no2",
    }

    async with aiohttp.ClientSession() as session:
        data = await fetch_json(session, url, params=params)

    air_points: List[Dict[str, Any]] = []
    stations: List[Dict[str, Any]] = []

    if not data or "results" not in data:
        return air_points, stations

    for r in data["results"]:
        try:
            lat = r["coordinates"]["latitude"]
            lon = r["coordinates"]["longitude"]
            pm25_val = None
            no2_val = None
            for m in r.get("measurements", []):
                if m.get("parameter") == "pm25":
                    pm25_val = float(m.get("value"))
                if m.get("parameter") == "no2":
                    no2_val = float(m.get("value"))
            aqi = aqi_from_pm25(pm25_val) if pm25_val is not None else None
            intensity = None
            if aqi is not None:
                intensity = min(1.0, max(0.05, aqi / 200.0))
            air_points.append({
                "lat": lat, "lon": lon, "intensity": intensity or 0.3,
                "aqi": aqi, "pm25": pm25_val, "no2": no2_val,
                "city": r.get("city"), "station": r.get("location"),
                "source": "OpenAQ"
            })
            stations.append({
                "name": r.get("location"),
                "lat": lat, "lon": lon,
                "last_updated": r.get("measurements", [{}])[0].get("lastUpdated"),
                "source": "OpenAQ",
            })
        except Exception:
            continue
    return air_points, stations

# =========================
# Funciones auxiliares existentes
# =========================
async def get_wind_grid_from_power(bbox: List[float], grid: int = 3) -> List[Dict[str, Any]]:
    """Función existente - mantener igual"""
    min_lon, min_lat, max_lon, max_lat = bbox
    lats = [min_lat + (max_lat - min_lat) * i / (grid - 1) for i in range(grid)]
    lons = [min_lon + (max_lon - min_lon) * j / (grid - 1) for j in range(grid)]

    url = "https://power.larc.nasa.gov/api/temporal/hourly/point"
    out: List[Dict[str, Any]] = []
    try:
        async with aiohttp.ClientSession() as session:
            tasks = []
            for la in lats:
                for lo in lons:
                    params = {
                        "parameters": "WS10M,WD10M",
                        "community": "RE",
                        "longitude": lo,
                        "latitude": la,
                        "format": "JSON",
                        "start": datetime.utcnow().strftime("%Y%m%d"),
                        "end": datetime.utcnow().strftime("%Y%m%d"),
                    }
                    tasks.append(fetch_json(session, url, params=params))
            results = await asyncio.gather(*tasks)

        for idx, data in enumerate(results):
            if not data:
                continue
            try:
                ws = list(data["properties"]["parameter"]["WS10M"].values())[-1]
                wd = list(data["properties"]["parameter"]["WD10M"].values())[-1]
                la = lats[idx // len(lons)]
                lo = lons[idx % len(lons)]
                if ws != -999:
                    out.append({"lat": la, "lon": lo, "speed": float(ws), "direction": float(wd), "source": "NASA POWER"})
            except Exception:
                continue
    except Exception as e:
        logger.warning(f"Error en NASA POWER: {e}")

    if not out:
        for la in lats:
            for lo in lons:
                out.append({
                    "lat": la,
                    "lon": lo,
                    "speed": round(random.uniform(2.5, 9.8), 1),
                    "direction": random.randint(0, 360),
                    "source": "simulated",
                })
    return out

async def get_volcanoes_eonet(bbox: List[float], days: int = 14) -> List[Dict[str, Any]]:
    """Función existente - mantener igual"""
    url = "https://eonet.gsfc.nasa.gov/api/v3/events"
    params = {"days": days, "status": "open", "category": "volcanoes", "api_key": NASA_API_KEY}
    out: List[Dict[str, Any]] = []
    try:
        async with aiohttp.ClientSession() as session:
            data = await fetch_json(session, url, params=params)
        for ev in data.get("events", []):
            for g in ev.get("geometry", []):
                coords = g.get("coordinates", [])
                if len(coords) == 2:
                    lon, lat = coords
                    if in_bbox(lon, lat, bbox):
                        out.append({
                            "name": ev.get("title", "Volcán activo"),
                            "lat": lat,
                            "lon": lon,
                            "status": "activo",
                            "date": g.get("date"),
                            "source": "NASA EONET",
                        })
                        break
    except Exception as e:
        logger.warning(f"Error al consultar volcanes EONET: {e}")

    if not out:
        out = [
            {"name": "Volcán de Fuego", "lat": 14.473, "lon": -90.88, "status": "activo", "source": "simulated"},
            {"name": "Pacaya", "lat": 14.382, "lon": -90.601, "status": "moderado", "source": "simulated"},
            {"name": "Santiaguito", "lat": 14.757, "lon": -91.566, "status": "activo", "source": "simulated"},
        ]
    return out

async def get_earthquakes_usgs(bbox: List[float]) -> List[Dict[str, Any]]:
    """Función existente - mantener igual"""
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    out: List[Dict[str, Any]] = []
    try:
        async with aiohttp.ClientSession() as session:
            data = await fetch_json(session, url)

        for f in data.get("features", []):
            lon, lat, depth = f["geometry"]["coordinates"]
            if in_bbox(lon, lat, bbox):
                out.append({
                    "lat": lat,
                    "lon": lon,
                    "magnitude": round(f["properties"]["mag"] or 0, 1),
                    "depth": round(depth, 1),
                    "place": f["properties"]["place"] or "Sin descripción",
                    "time": datetime.utcfromtimestamp(f["properties"]["time"] / 1000).isoformat(),
                    "source": "USGS",
                })
    except Exception as e:
        logger.warning(f"Error al obtener sismos USGS: {e}")

    if not out:
        for _ in range(5):
            out.append({
                "lat": round(random.uniform(13.0, 16.0), 4),
                "lon": round(random.uniform(-91.5, -88.0), 4),
                "magnitude": round(random.uniform(3.5, 6.0), 1),
                "depth": round(random.uniform(10, 70), 1),
                "place": "Epicentro simulado",
                "time": datetime.utcnow().isoformat(),
                "source": "simulated",
            })
    return out

# =========================
# Función auxiliar para obtener datos ambientales para alertas
# =========================
async def get_environmental_data_for_alerts() -> Dict[str, Any]:
    """Obtiene datos ambientales necesarios para las alertas"""
    try:
        # Obtener datos de sismos y volcanes
        earthquakes = await get_earthquakes_usgs(GUATEMALA_BBOX)
        volcanoes = await get_volcanoes_eonet(GUATEMALA_BBOX)
        
        # Obtener datos meteorológicos
        weather_data = await get_weather_data_meteomatics(CENTER_GT["lat"], CENTER_GT["lon"])
        
        return {
            "earthquakes": earthquakes,
            "volcanoes": volcanoes,
            "weather": weather_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error obteniendo datos para alertas: {e}")
        return {"earthquakes": [], "volcanoes": [], "weather": {}, "timestamp": datetime.utcnow().isoformat()}

# =========================
# Endpoints principales MEJORADOS
# =========================
@app.get("/")
async def root():
    return {
        "message": "🌎 NASA Guatemala Environmental API",
        "version": "4.1.0",
        "status": "active",
        "docs": "/docs",
        "endpoints": {
            "dashboard": "/dashboard/summary",
            "environment_full": "/environment/full",
            "weather": "/weather/current",
            "weather_forecast": "/weather/forecast",
            "alerts": "/alerts/check",
            "alerts_history": "/alerts/history",
            "alerts_stats": "/alerts/stats",
            "health": "/health"
        },
        "features": {
            "firebase_enabled": notification_service.enabled,
            "firestore_enabled": notification_service.firestore_enabled,
            "notifications": True,
            "data_persistence": True
        }
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow().isoformat(), 
        "region": "Guatemala",
        "firebase": notification_service.enabled,
        "firestore": notification_service.firestore_enabled
    }

@app.get("/dashboard/summary")
async def dashboard_summary(background_tasks: BackgroundTasks):
    cache_key = "dashboard_summary"
    if cache_key in cache:
        return cache[cache_key]

    try:
        # Obtener datos meteorológicos actuales
        weather_data = await get_weather_data_meteomatics(CENTER_GT["lat"], CENTER_GT["lon"])
        
        pollution = generate_pollution_data()
        pm25 = pollution["PM25"]
        no2 = pollution["NO2"]
        aqi = aqi_from_pm25(pm25)
        aqi_category = get_aqi_category(aqi)

        # Obtener datos para alertas
        env_data = await get_environmental_data_for_alerts()
        
        # Procesar alertas en segundo plano
        background_tasks.add_task(alert_manager.process_and_send_alerts, env_data)

        # Obtener estadísticas recientes de alertas
        recent_alerts = await notification_service.get_recent_alerts(limit=5)

        # Serie temporal demo estable
        pollutants = ["NO2", "O3", "PM25", "HCHO"]
        ts = {}
        for p in pollutants:
            series = []
            for i in range(7, 0, -1):
                timestamp = (datetime.utcnow() - timedelta(hours=i)).strftime("%H:%M")
                base = pollution[p]
                val = base * (0.8 + 0.4 * random.random())
                series.append({"timestamp": timestamp, "value": round(val, 1)})
            ts[p] = series

        alerts = []
        if aqi > 100:
            alerts.append({
                "severity": "high",
                "title": f"Calidad del aire {aqi_category['category']}",
                "ts": (datetime.utcnow() - timedelta(minutes=20)).isoformat(),
                "location": "Área Metropolitana",
                "pollutant": "PM2.5",
                "value": f"{pm25:.1f} µg/m³",
                "description": f"Se recomienda precaución.",
            })

        # Verificar condiciones meteorológicas para alertas
        if weather_data.get("precipitation", 0) > 20:  # Lluvia intensa
            alerts.append({
                "severity": "medium",
                "title": "Lluvia intensa",
                "ts": datetime.utcnow().isoformat(),
                "location": "Región Central",
                "description": "Precipitación intensa detectada",
            })

        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "center": CENTER_GT,
            "weather": weather_data,
            "metrics": {
                "aqi": aqi,
                "aqi_category": aqi_category,
                "no2_avg_ugm3": round(no2, 1),
                "pm25_avg_ugm3": round(pm25, 1),
                "temperature": weather_data.get("temperature"),
                "humidity": weather_data.get("humidity"),
                "active_events": len(alerts),
                "recent_alerts_count": len(recent_alerts),
            },
            "kpis": [
                {"label": "Índice AQI", "value": aqi, "unit": "", "trend": "stable", "category": aqi_category["category"], "color": aqi_category["color"]},
                {"label": "Temperatura", "value": weather_data.get("temperature"), "unit": "°C", "trend": "stable"},
                {"label": "Humedad", "value": weather_data.get("humidity"), "unit": "%", "trend": "stable"},
                {"label": "PM₂.₅ Promedio", "value": round(pm25, 1), "unit": "µg/m³", "trend": "up" if pm25 > 45 else "down"},
            ],
            "map": {"mode": "heatmap", "heatmap_data": {"points": fallback_heatmap_points(), "radius": 25, "blur": 15}},
            "timeseries_24h": ts,
            "alerts_recent": alerts,
            "recent_alerts": recent_alerts,
            "data_quality": {
                "source": "Meteomatics + Simulación", 
                "last_updated": datetime.utcnow().isoformat(), 
                "demo_mode": DEMO_MODE
            },
            "notification_status": {
                "firebase_enabled": notification_service.enabled,
                "firestore_enabled": notification_service.firestore_enabled,
                "topic": FIREBASE_TOPIC
            }
        }

        cache[cache_key] = result
        return result
    except Exception as e:
        logger.error(f"dashboard_summary error: {e}")
        raise HTTPException(500, f"Error generando datos: {e}")

# =========================
# Endpoints meteorológicos
# =========================
@app.get("/weather/current")
async def weather_current(lat: float = CENTER_GT["lat"], lon: float = CENTER_GT["lon"]):
    """
    Obtiene condiciones meteorológicas actuales para una ubicación específica
    """
    cache_key = f"weather_current_{lat}_{lon}"
    if cache_key in cache:
        return cache[cache_key]
    
    try:
        weather_data = await get_weather_data_meteomatics(lat, lon)
        cache[cache_key] = weather_data
        return weather_data
    except Exception as e:
        logger.error(f"weather_current error: {e}")
        raise HTTPException(500, f"Error obteniendo datos meteorológicos: {e}")

@app.get("/weather/forecast")
async def weather_forecast(
    lat: float = CENTER_GT["lat"], 
    lon: float = CENTER_GT["lon"],
    days: int = 3
):
    """
    Obtiene pronóstico meteorológico para los próximos días
    """
    if days < 1 or days > 7:
        raise HTTPException(400, "El número de días debe estar entre 1 y 7")
    
    cache_key = f"weather_forecast_{lat}_{lon}_{days}"
    if cache_key in cache:
        return cache[cache_key]
    
    try:
        forecast = await get_weather_forecast_meteomatics(lat, lon, days)
        result = {
            "location": {"lat": lat, "lon": lon},
            "forecast_days": forecast,
            "last_updated": datetime.utcnow().isoformat()
        }
        cache[cache_key] = result
        return result
    except Exception as e:
        logger.error(f"weather_forecast error: {e}")
        raise HTTPException(500, f"Error obteniendo pronóstico: {e}")

@app.get("/weather/cities")
async def weather_cities():
    """
    Obtiene datos meteorológicos para las principales ciudades de Guatemala
    """
    cache_key = "weather_cities"
    if cache_key in cache:
        return cache[cache_key]
    
    try:
        cities_weather = []
        for city in GUATEMALA_CITIES:
            weather = await get_weather_data_meteomatics(city["lat"], city["lon"])
            cities_weather.append({
                "city": city["name"],
                "coordinates": {"lat": city["lat"], "lon": city["lon"]},
                "weather": weather,
                "population": city.get("population")
            })
        
        result = {
            "cities": cities_weather,
            "last_updated": datetime.utcnow().isoformat()
        }
        cache[cache_key] = result
        return result
    except Exception as e:
        logger.error(f"weather_cities error: {e}")
        raise HTTPException(500, f"Error obteniendo datos de ciudades: {e}")

# =========================
# Endpoints para Alertas MEJORADOS
# =========================
@app.post("/alerts/send-test")
async def send_test_alert(background_tasks: BackgroundTasks):
    """Endpoint para enviar una alerta de prueba"""
    test_alert = {
        "type": AlertType.AIR_QUALITY,
        "severity": AlertSeverity.HIGH,
        "title": "🔴 Alerta de Prueba - Calidad del Aire",
        "description": "Esta es una notificación de prueba del sistema de alertas ambientales.",
        "location": "Ciudad de Guatemala",
        "latitude": CENTER_GT["lat"],
        "longitude": CENTER_GT["lon"],
        "timestamp": datetime.utcnow().isoformat(),
        "details": {
            "test": True,
            "message": "Notificación de prueba exitosa",
            "recommendations": [
                "Esta es una alerta de prueba",
                "No se requiere acción"
            ]
        }
    }
    
    background_tasks.add_task(notification_service.send_alert_notification, test_alert)
    
    return {
        "message": "Alerta de prueba enviada y guardada en Firestore",
        "alert": test_alert,
        "firebase_enabled": notification_service.enabled,
        "firestore_enabled": notification_service.firestore_enabled
    }

@app.get("/alerts/check")
async def check_alerts(background_tasks: BackgroundTasks):
    """Verifica y envía alertas basadas en datos actuales"""
    try:
        # Obtener datos ambientales completos
        env_data = await get_environmental_data_for_alerts()
        
        # Procesar alertas
        alerts = await alert_manager.process_and_send_alerts(env_data)
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "alerts_found": len(alerts),
            "alerts_sent": [alert["title"] for alert in alerts],
            "firebase_enabled": notification_service.enabled,
            "firestore_enabled": notification_service.firestore_enabled
        }
        
    except Exception as e:
        logger.error(f"Error verificando alertas: {e}")
        raise HTTPException(500, f"Error verificando alertas: {e}")

@app.get("/alerts/history")
async def get_alerts_history(limit: int = 20, hours: int = 24, alert_type: str = None):
    """Obtiene historial de alertas desde Firestore"""
    try:
        alerts = await notification_service.get_recent_alerts(limit, alert_type)
        
        # Filtrar por horas si se especifica
        if hours > 0:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            filtered_alerts = []
            for alert in alerts:
                alert_time_str = alert.get("timestamp") or alert.get("created_at")
                if alert_time_str:
                    try:
                        alert_time = datetime.fromisoformat(alert_time_str.replace('Z', '+00:00'))
                        if alert_time > cutoff_time:
                            filtered_alerts.append(alert)
                    except:
                        filtered_alerts.append(alert)
                else:
                    filtered_alerts.append(alert)
            alerts = filtered_alerts
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_alerts": len(alerts),
            "limit": limit,
            "hours": hours,
            "alert_type": alert_type,
            "alerts": alerts,
            "firestore_enabled": notification_service.firestore_enabled
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo historial de alertas: {e}")
        raise HTTPException(500, f"Error obteniendo historial: {e}")

@app.get("/alerts/stats")
async def get_alerts_stats(days: int = 7):
    """Obtiene estadísticas de alertas"""
    try:
        alerts = await notification_service.get_recent_alerts(limit=1000)
        
        # Filtrar por días
        if days > 0:
            cutoff_time = datetime.utcnow() - timedelta(days=days)
            alerts = [
                alert for alert in alerts 
                if any([
                    datetime.fromisoformat(alert.get(field, "2000-01-01").replace('Z', '+00:00')) > cutoff_time
                    for field in ["timestamp", "created_at"]
                    if field in alert
                ])
            ]
        
        # Estadísticas por tipo
        type_stats = {}
        severity_stats = {}
        status_stats = {}
        
        for alert in alerts:
            alert_type = alert.get("type", "unknown")
            severity = alert.get("severity", "unknown")
            status = alert.get("status", "unknown")
            
            type_stats[alert_type] = type_stats.get(alert_type, 0) + 1
            severity_stats[severity] = severity_stats.get(severity, 0) + 1
            status_stats[status] = status_stats.get(status, 0) + 1
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "period_days": days,
            "total_alerts": len(alerts),
            "by_type": type_stats,
            "by_severity": severity_stats,
            "by_status": status_stats,
            "firestore_enabled": notification_service.firestore_enabled
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(500, f"Error obteniendo estadísticas: {e}")

# =========================
# Endpoint environment_full mejorado
# =========================
@app.get("/environment/full")
async def environment_full(global_mode: bool = False):
    """
    🌎 Devuelve datos ambientales completos (calidad del aire, clima, etc.)
    """
    cache_key = "environment_full_global" if global_mode else "environment_full_local"
    if cache_key in cache:
        return cache[cache_key]

    try:
        bbox = None if global_mode else GUATEMALA_BBOX
        air_points, stations = await get_air_quality_and_stations_from_openaq_global() if global_mode else await get_air_quality_and_stations_from_openaq(GUATEMALA_BBOX)

        if not air_points:
            air_points = fallback_heatmap_points()
            stations = [{"name": "Fallback", "lat": 0, "lon": 0, "source": "fallback"}]

        # Obtener datos meteorológicos para el centro
        center_lat = CENTER_GT["lat"] if not global_mode else 0
        center_lon = CENTER_GT["lon"] if not global_mode else 0
        weather_data = await get_weather_data_meteomatics(center_lat, center_lon)

        # Calcular centro dinámico
        if air_points:
            avg_lat = sum(p["lat"] for p in air_points) / len(air_points)
            avg_lon = sum(p["lon"] for p in air_points) / len(air_points)
            center = {"lat": avg_lat, "lon": avg_lon, "name": "Global" if global_mode else "Guatemala"}
        else:
            center = CENTER_GT

        # Obtener otros datos ambientales
        wind = await get_wind_grid_from_power(GUATEMALA_BBOX)
        volcanoes = await get_volcanoes_eonet(GUATEMALA_BBOX)
        earthquakes = await get_earthquakes_usgs(GUATEMALA_BBOX)

        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "region": "Global" if global_mode else "Guatemala",
            "center": center,
            "bbox": bbox or [-180, -90, 180, 90],
            "weather": weather_data,
            "air_quality": air_points,
            "stations": stations,
            "wind": wind,
            "volcanoes": volcanoes,
            "earthquakes": earthquakes,
            "sources": {
                "weather": "Meteomatics",
                "air_quality": "OpenAQ",
                "stations": "OpenAQ",
                "wind": "NASA POWER",
                "volcanoes": "NASA EONET",
                "earthquakes": "USGS",
            },
        }

        cache[cache_key] = result
        return result

    except Exception as e:
        logger.error(f"environment_full error: {e}")
        raise HTTPException(500, f"Error obteniendo datos ambientales: {e}")

# =========================
# Endpoints adicionales existentes
# =========================
@app.get("/cities/pollution")
async def get_cities_pollution():
    cities_data = []
    for city in GUATEMALA_CITIES:
        pollution = generate_pollution_data()
        aqi = aqi_from_pm25(pollution["PM25"])
        category = get_aqi_category(aqi)
        cities_data.append({
            "city": city["name"],
            "coordinates": {"lat": city["lat"], "lon": city["lon"]},
            "pollution": {k: round(v, 1) for k, v in pollution.items()},
            "aqi": aqi,
            "aqi_category": category,
            "last_updated": datetime.utcnow().isoformat()
        })
    return {"cities": cities_data}

@app.get("/pollutants/{pollutant}")
async def get_pollutant_detail(pollutant: str):
    if pollutant.upper() not in ["NO2", "O3", "PM25", "HCHO"]:
        raise HTTPException(404, "Contaminante no encontrado")
    pollution_data = generate_pollution_data()
    value = pollution_data.get(pollutant.upper(), 0)
    return {
        "pollutant": pollutant.upper(),
        "current_value": round(value, 1),
        "unit": "µg/m³",
        "description": f"Datos de {pollutant} para Guatemala",
        "last_updated": datetime.utcnow().isoformat()
    }

# =========================
# Startup MEJORADO
# =========================
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 NASA Guatemala API v4.1 started successfully")
    logger.info("📍 http://127.0.0.1:8000  |  📚 /docs")
    
    if METEOMATICS_USERNAME and METEOMATICS_PASSWORD:
        logger.info("✅ Meteomatics configured successfully")
    else:
        logger.warning("⚠️  Meteomatics not configured - using simulated data")
    
    if notification_service.enabled:
        logger.info("✅ Firebase configured successfully")
        logger.info(f"📱 Notification topic: {FIREBASE_TOPIC}")
    else:
        logger.warning("⚠️  Firebase not configured - notifications disabled")
    
    if notification_service.firestore_enabled:
        logger.info("✅ Firestore configured successfully - Alerts will be saved in the database")
    else:
        logger.warning("⚠️  Firestore not configured - alerts will not be saved")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
