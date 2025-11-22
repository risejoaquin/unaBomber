// --- 1. IMPORTACIONES (CRUCIALES PARA EVITAR PANTALLA NEGRA) ---
import Phaser from 'phaser';
// Nota los dos puntos "../" para salir de la carpeta 'scenes' y entrar en 'objects'
import Player from '../objects/Player.js';
import Seal from '../objects/Seal.js';
import Enemy from '../objects/Enemy.js';
import Explosion from '../objects/Explosion.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Inicializamos variables para que estén disponibles en toda la clase
        this.player = null;
        this.cursors = null;
    }

    create() {
        // Constantes para configuración
        const TILE_SIZE = 16;
        const SCALE_FACTOR = 3; // Factor de escala global

        // --- 2. MAPA Y TILESET ---
        const map = this.make.tilemap({ key: 'map_level1' });
        // Asegúrate que '0x72_DungeonTilesetII_v1.7' es el nombre en Tiled
        // y 'dungeon_tileset_image' es el key usado en BootScene.preload
        const tileset = map.addTilesetImage('0x72_DungeonTilesetII_v1.7', 'dungeon_tileset_image');

        // Escalamos el contenedor del mapa completo. Las capas creadas después heredarán esto.
        map.setScale(SCALE_FACTOR);

        // --- 3. CAPAS VISUALES (El orden importa: primero el fondo) ---
        // Capa de Suelo
        this.groundLayer = map.createLayer('ground', tileset, 0, 0);

        // Capa de Muros (Colisión)
        this.wallsLayer = map.createLayer('walls', tileset, 0, 0);
        // Activa colisiones para los tiles marcados en Tiled con la propiedad 'collides: true'
        this.wallsLayer.setCollisionByProperty({ collides: true });

        // Capa de Objetos Fijos
        this.staticObjectsLayer = map.createLayer('static_objects', tileset, 0, 0);
        this.staticObjectsLayer.setCollisionByProperty({ collides: true });

        // Capa de Objetos Destructibles
        this.kitkatLayer = map.createLayer('kitkat', tileset, 0, 0);
        this.kitkatLayer.setCollisionByProperty({ collides: true });


        // --- 4. JUGADOR (Lo creamos DESPUÉS de las capas para que se vea encima) ---
        // Posición inicial (Tile 5,5). Como el mapa está escalado, Phaser ajusta la posición visualmente.
        this.player = new Player(this, TILE_SIZE * 5, TILE_SIZE * 5, 'player');
        // Escalamos el jugador también para que coincida con el mapa
        this.player.setScale(SCALE_FACTOR);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Ajustar el tamaño del cuerpo de colisión si es necesario (opcional, depende de tu sprite)
        // this.player.body.setSize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);
        // this.player.body.setOffset(TILE_SIZE * 0.1, TILE_SIZE * 0.2);


        // --- 5. COLISIONES ---
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.staticObjectsLayer);
        this.physics.add.collider(this.player, this.kitkatLayer);


        // --- 6. CÁMARA Y LÍMITES DEL MUNDO ---
        // Calculamos el tamaño real del mundo escalado
        const worldWidth = map.widthInPixels * SCALE_FACTOR;
        const worldHeight = map.heightInPixels * SCALE_FACTOR;

        // Establecemos los límites físicos del mundo
        this.physics.world.bounds.width = worldWidth;
        this.physics.world.bounds.height = worldHeight;

        // Configuración de la cámara
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1); // Zoom 1 porque ya escalamos los objetos
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Configurar controles (necesario si Player.js los usa en update)
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        // Llamamos al método update del jugador si existe
        if (this.player) {
            this.player.update(time, delta);
        }
    }
}