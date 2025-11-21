import Phaser from 'phaser';
import Seal from '../objects/Seal.js';
import Enemy from '../objects/Enemy.js';
import Explosion from '../objects/Explosion.js'; // Importante importar esto

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // --- 1. MAPA ---
        const map = this.make.tilemap({ key: 'map_level1' });

        // Asegúrate de que este nombre coincida con el que pusiste en Tiled al incrustar
        // (y que la ruta en BootScene sea correcta)
        const tileset = map.addTilesetImage('0x72_DungeonTilesetII_v1.7', 'tileset_img');

        // --- CREAR CAPAS VISUALES (Usando tus nuevos nombres) ---
        // El orden importa: de atrás hacia adelante.

        // 1. Suelo (Fondo, sin colisión)
        this.groundLayer = map.createLayer('ground', tileset, 0, 0);
        this.groundLayer.setScale(3);

        // 2. Muros Límite (Colisión)
        this.wallsLayer = map.createLayer('walls', tileset, 0, 0);
        this.wallsLayer.setScale(3);
        // Activar colisión para todos los tiles que tienen la propiedad 'collides: true'
        this.wallsLayer.setCollisionByProperty({ collides: true });

        // 3. Objetos Fijos Interiores (Colisión) - Estatuas, barriles no rompibles, etc.
        this.staticObjectsLayer = map.createLayer('static_objects', tileset, 0, 0);
        this.staticObjectsLayer.setScale(3);
        // Activar colisión si el tile tiene 'collides: true'
        this.staticObjectsLayer.setCollisionByProperty({ collides: true });

        // 4. Objetos Destructibles "kitkat" (Colisión, por ahora)
        // Puedes añadir cajas u otros elementos rompibles aquí en Tiled
        this.kitkatLayer = map.createLayer('kitkat', tileset, 0, 0);
        this.kitkatLayer.setScale(3);
        // Activar colisión si el tile tiene 'collides: true'
        this.kitkatLayer.setCollisionByProperty({ collides: true });


        // --- 2. GRUPOS (Para manejar múltiples objetos del mismo tipo) ---
        // Grupo para las "focas" (sellos o kits de vida)
        this.seals = this.physics.add.group({ classType: Seal, runChildUpdate: true });
        // Grupo para los enemigos
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        // Grupo para fuegos de explosión
        this.explosionGroup = this.physics.add.group({ classType: Explosion, runChildUpdate: true });


        // --- 3. JUGADOR ---
        const TILE_SIZE = 16; // Tamaño original de un tile
        const SCALE_FACTOR = 3; // Factor de escala para el juego

        // Posición inicial tentativa del jugador (ajústala según tu mapa)
        // Por ejemplo, en la esquina superior izquierda
        this.player = this.physics.add.sprite(TILE_SIZE * SCALE_FACTOR * 1.5, TILE_SIZE * SCALE_FACTOR * 1.5, 'hero');
        this.player.setScale(SCALE_FACTOR);
        this.player.body.setOffset(12, 16); // Ajustar el offset del cuerpo de colisión si el sprite no lo rellena
        this.player.setCollideWorldBounds(true); // El jugador no puede salir del mapa
        this.player.setDepth(10); // Asegura que el jugador esté por encima de las capas del mapa


        // --- 4. COLISIONES ---
        // El jugador colisiona con las paredes fijas
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.staticObjectsLayer);
        this.physics.add.collider(this.player, this.kitkatLayer); // El jugador colisiona con las cajas destructibles

        // --- 5. ENTRADAS (Controles del jugador) ---
        this.cursors = this.input.keyboard.createCursorKeys(); // Flechas del teclado
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Barra espaciadora

        // --- 6. ANIMACIONES (si tienes spritesheet para el jugador) ---
        // Ejemplo de animación (necesitas definir los frames en BootScene)
        // this.anims.create({
        //     key: 'walk',
        //     frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
        //     frameRate: 10,
        //     repeat: -1
        // });


        // --- 7. AJUSTAR LÍMITES DEL MUNDO FÍSICO ---
        // Esto es importante para que la cámara y las físicas sepan dónde termina el mapa escalado
        const worldWidth = map.widthInPixels * SCALE_FACTOR;
        const worldHeight = map.heightInPixels * SCALE_FACTOR;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);


        // --- 8. CÁMARA ---
        // Configuración para mostrar todo el mapa completo y centrado.
        // Ya no necesitamos startFollow porque queremos una vista completa.
        // this.cameras.main.startFollow(this.player);

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight); // Establece límites del mundo para la cámara
        this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2); // Centra la cámara en el centro del mapa

        // Calcular el zoom para que todo el mapa quepa exactamente en la ventana del juego
        // (que ya hemos configurado como cuadrada en main.js)
        const zoomX = this.scale.width / worldWidth;
        const zoomY = this.scale.height / worldHeight;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY)); // Usa el menor zoom para que todo quepa

        // Asegurarse de que la cámara no tenga desplazamiento inicial
        this.cameras.main.setScroll(0, 0);

        // --- 9. OTROS ---
        // Aquí puedes añadir la lógica para colocar enemigos, bombas, etc.
    }

    update(time, delta) {
        // --- MOVER JUGADOR ---
        this.player.setVelocity(0); // Detiene al jugador si no se presiona nada

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            // this.player.anims.play('walk', true); // Si tienes animación de caminar
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            // this.player.anims.play('walk', true);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
            // this.player.anims.play('walk', true);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
            // this.player.anims.play('walk', true);
        }
        // else {
        //     this.player.anims.stop(); // Detiene la animación si no se mueve
        // }

        // --- LANZAR BOMBA (Ejemplo) ---
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            console.log('Bomba lanzada!');
            // Aquí iría la lógica para crear una bomba
        }
    }
}