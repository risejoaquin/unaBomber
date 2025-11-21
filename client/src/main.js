// client/src/main.js

// --- ESCENA DE ARRANQUE Y PRUEBA ---
// Esta escena solo sirve para verificar que los assets cargan bien.
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    // 1. PRELOAD: Aquí se cargan las imágenes en memoria
    preload() {
        console.log('--> BootScene: Iniciando precarga de assets...');

        // Cargamos el Tileset principal
        // NOTA: La ruta es relativa a la carpeta 'client/'
        this.load.image('tileset_base', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');

        // Cargamos el sprite del héroe (Kuroro)
        this.load.image('hero_test', 'assets/sprites/hero.png');
    }

    // 2. CREATE: Se ejecuta una vez que todo está cargado
    create() {
        console.log('--> BootScene: Carga completa. Mostrando prueba.');

        // Obtener el centro de la pantalla
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Mostrar un texto de éxito
        this.add.text(centerX, centerY - 100, 'unaBomber v0.1\nMotor Gráfico Online', {
            fontSize: '24px',
            color: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);

        // Mostrar el tileset entero para ver que cargó (escalado al 50% porque es grande)
        this.add.image(centerX, centerY + 50, 'tileset_base').setScale(0.5).setAlpha(0.7);

        // Mostrar al héroe encima
        const hero = this.add.image(centerX, centerY + 50, 'hero_test').setScale(3);

        // Una pequeña animación de "latido" para ver que el loop del juego funciona
        this.tweens.add({
            targets: hero,
            scale: 3.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // PRUEBA DE CONEXIÓN CON EL BACKEND
        // Intentamos llamar a la API que creamos en server/index.js
        fetch('http://localhost:3000/api/status')
            .then(response => response.json())
            .then(data => {
                console.log('--> ¡Conexión con Backend exitosa!', data);
                this.add.text(centerX, centerY + 180, `Backend: ${data.estado}`, { color: '#00ffff' }).setOrigin(0.5);
            })
            .catch(error => {
                console.error('--> Error conectando al backend:', error);
                this.add.text(centerX, centerY + 180, 'Backend: OFFLINE (Error)', { color: '#ff0000' }).setOrigin(0.5);
            });
    }
}


// --- CONFIGURACIÓN PRINCIPAL DE PHASER ---
const config = {
    type: Phaser.AUTO, // Usa WebGL si está disponible, si no Canvas
    width: 800,        // Ancho del juego en píxeles
    height: 600,       // Alto del juego en píxeles
    backgroundColor: '#111111', // Color de fondo mientras carga
    parent: 'game-container', // ID del div en el HTML donde se meterá el juego
    pixelArt: true, // IMPORTANTE para que los sprites retro se vean nítidos
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down, no hay gravedad hacia abajo
            debug: true // Muestra cajas de colisión (útil para desarrollo)
        }
    },
    // La lista de escenas que tiene el juego. Por ahora solo la de prueba.
    scene: [BootScene]
};

// Iniciar el juego
const game = new Phaser.Game(config);