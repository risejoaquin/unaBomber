💣 unaBOMBER
Un juego de laberintos y bombas con temática de fantasía gótica, construido con React y Phaser, utilizando Firebase para la gestión de usuarios y la progresión.

⚙️ Tecnologías Clave
Frontend: React, TypeScript, Vite.

Motor de Juego: Phaser 3.

Autenticación: Firebase Auth (Google, Email/Pwd, Anónimo, Teléfono).

Base de Datos: Firebase Firestore (Perfiles y Leaderboard).

Servidor API: Express.js.

✨ Características Principales
🎮 Jugabilidad y Progresión
Modos de Juego: Historia (7 niveles con narrativa) y Hardcore (niveles infinitos).

Sistema de XP y Nivelación: Gana experiencia por destruir bloques, eliminar enemigos, conseguir Chain Hits y completar niveles.

Power-ups: Recolectables para aumentar la velocidad, el rango de la bomba y el límite de bombas.

Enemigos: Inteligencia artificial simple con un radio de proximidad para seguir al jugador.

👤 Plataforma y Social
Recompensa Horaria: Reclama 100 💰 monedas cada hora.

Personalización: Soporte para subir avatares personalizados a Firebase Storage.

Leaderboard Global: Muestra el Top 10 de jugadores por XP total.

🛠️ Configuración e Instalación
Requisitos Previos
Node.js (LTS recomendado).

Un proyecto de Firebase configurado con Firestore, Auth y Storage.

Pasos de Configuración
Clona el repositorio e instala dependencias:

git clone <url-del-repositorio>
cd unabomber
npm install

Configura el archivo .env en la raíz del proyecto. Obtén tus claves de configuración de Firebase y añádelas:
# .env
VITE_FIREBASE_API_KEY="TU_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="TU_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="TU_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="TU_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="TU_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="TU_APP_ID"

PORT=3000

Ejecución del Proyecto
Usa el script dev para levantar el frontend y el backend simultáneamente:

npm run dev
