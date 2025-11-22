import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import Bomb from '../objects/Bomb.js';
import Explosion from '../objects/Explosion.js';

/**
 * GameScene: La escena principal donde ocurre toda la lógica del juego.
 * Encargada de inicializar el mundo, crear entidades, configurar colisiones
 * y gestionar la cámara y los controles globales.
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Propiedades de la escena inicializadas a null para mayor claridad y control de flujo
        this.map = null;
        this.groundLayer = null;
        this.wallsLayer = null;
        this.destructibleLayer = null;
        this.player = null;
        this.cursors = null; // Objeto para manejar las entradas del teclado

        // Grupos de físicas para gestionar colecciones de objetos similares de manera eficiente
        this.enemiesGroup = null;
        this.bombsGroup = null;
        this.explosionsGroup = null;

        // Constantes de configuración globales para el juego, escalabilidad y tamaño de tiles
        this.SCALE_FACTOR = 3; // Factor de escalado para los sprites y el mapa (pixel art)
        this.TILE_SIZE = 16;   // Tamaño original de un tile en píxeles (16x16)
    }

    create() {
        console.log('--- GameScene: Inicializando mundo de juego ---');

        // 1. Creación y configuración del mapa de Tiled
        this.createMap();

        // 2. Inicialización de Grupos de objetos, crucial para gestionar las físicas y el reciclaje
        // runChildUpdate: true asegura que el método update() de cada objeto del grupo se llame automáticamente
        this.enemiesGroup = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        // Limitar la cantidad de bombas activas para evitar spam y gestionar el rendimiento
        this.bombsGroup = this.physics.add.group({ classType: Bomb, runChildUpdate: true, maxSize: 10 });
        this.explosionsGroup = this.physics.add.group({ classType: Explosion, runChildUpdate: true, maxSize: 50 });

        // 3. Creación de las entidades principales del juego (Jugador y Enemigos)
        this.createPlayer();
        this.spawnEnemies();

        // 4. Configuración de todas las interacciones de colisión y superposición (overlap)
        this.setupCollisions();

        // 5. Configuración de la cámara para seguir al jugador y los controles de input
        this.setupCameraAndControls();
    }

    /**
     * Crea el mapa del juego utilizando el JSON exportado de Tiled.
     * Configura las capas y las colisiones estáticas.
     */
    createMap() {
        // 'map_level1' es la KEY definida en BootScene para el JSON del mapa
        this.map = this.make.tilemap({ key: 'map_level1' });

        // '0x72_DungeonTilesetII_v1.7' es el NOMBRE EXACTO del tileset DENTRO del archivo level1.json
        // 'tileset_main' es la KEY que Phaser usa para la imagen del tileset (definida en BootScene)
        const tileset = this.map.addTilesetImage('0x72_DungeonTilesetII_v1.7', 'tileset_main');

        // Escala el mapa completo (tiles y sprites)
        this.map.setScale(this.SCALE_FACTOR);

        // Creación de capas, utilizando los NOMBRES EXACTOS de las capas en Tiled
        // Las capas se crean en (0,0) de las coordenadas del mundo
        this.groundLayer = this.map.createLayer('ground', tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('walls', tileset, 0, 0); // Capa de muros indestructibles
        this.destructibleLayer = this.map.createLayer('kitkat', tileset, 0, 0); // Capa de bloques destructibles

        // Activa las colisiones para los tiles que tienen la propiedad 'collides: true' en Tiled
        this.wallsLayer.setCollisionByProperty({ collides: true });
        this.destructibleLayer.setCollisionByProperty({ collides: true });
    }

    /**
     * Crea una instancia del jugador en una posición inicial.
     */
    createPlayer() {
        // Calcula la posición de spawn: (1.5 * TILE_SIZE) para centrarlo en el segundo tile y escalar
        const spawnX = (this.TILE_SIZE * 1.5) * this.SCALE_FACTOR;
        const spawnY = (this.TILE_SIZE * 1.5) * this.SCALE_FACTOR;

        // Instancia la clase Player, pasándole la escena y las coordenadas
        this.player = new Player(this, spawnX, spawnY);
        this.player.setScale(this.SCALE_FACTOR); // Escala el sprite del jugador
    }

    /**
     * Genera enemigos en el mapa.
     * Idealmente, las posiciones se leerían de una capa de objetos en Tiled.
     */
    spawnEnemies() {
        // Ejemplo de spawn de un enemigo en una posición fija (10.5, 5.5 en coordenadas de tiles)
        const enemyX = (this.TILE_SIZE * 10.5) * this.SCALE_FACTOR;
        const enemyY = (this.TILE_SIZE * 5.5) * this.SCALE_FACTOR;
        // Obtiene un enemigo del pool (grupo) y lo activa
        const enemy = this.enemiesGroup.get(enemyX, enemyY);
        if (enemy) { // Verifica si se pudo obtener un enemigo del pool
            enemy.setScale(this.SCALE_FACTOR); // Escala el sprite del enemigo
            enemy.init(); // Inicializa el comportamiento del enemigo (ej. dirección de movimiento)
        }
    }

    /**
     * Configura todas las reglas de colisión y superposición del juego.
     * Utiliza Phaser.Physics.Arcade.Collider para colisiones con rebote/bloqueo.
     * Utiliza Phaser.Physics.Arcade.Overlap para detectar contacto sin interrupción física (daño, recogida).
     */
    setupCollisions() {
        // Colisiones con el entorno estático (jugador y enemigos no pueden atravesar muros)
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.destructibleLayer);
        this.physics.add.collider(this.enemiesGroup, this.wallsLayer);
        this.physics.add.collider(this.enemiesGroup, this.destructibleLayer);

        // Colisiones entre el jugador/enemigos y las bombas (las bombas bloquean el paso hasta que explotan)
        this.physics.add.collider(this.player, this.bombsGroup);
        this.physics.add.collider(this.enemiesGroup, this.bombsGroup);

        // --- Interacciones Letaes (detectadas por Overlap) ---

        // 1. Jugador toca Enemigo: el jugador muere
        this.physics.add.overlap(this.player, this.enemiesGroup, (player, enemy) => {
            player.die();
        });

        // 2. Explosión toca Jugador: el jugador muere
        this.physics.add.overlap(this.explosionsGroup, this.player, (explosion, player) => {
            player.die();
        });

        // 3. Explosión toca Enemigo: el enemigo muere
        this.physics.add.overlap(this.explosionsGroup, this.enemiesGroup, (explosion, enemy) => {
            enemy.die();
        });

        // 4. Explosión toca Muro Destructible ('kitkat'): el muro se destruye
        this.physics.add.overlap(this.explosionsGroup, this.destructibleLayer, (explosion, tile) => {
            // 'tile' es un objeto Tile de Phaser. removeTileAt(x,y) elimina el tile del mapa.
            this.destructibleLayer.removeTileAt(tile.x, tile.y);
        });
    }

    /**
     * Configura la cámara para seguir al jugador y establece los límites del mundo.
     * También inicializa los controles del teclado.
     */
    setupCameraAndControls() {
        // Calcula el tamaño total del mundo escalado
        const worldWidth = this.map.widthInPixels * this.SCALE_FACTOR;
        const worldHeight = this.map.heightInPixels * this.SCALE_FACTOR;

        // Establece los límites del mundo de físicas para que el jugador no pueda salir del mapa
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        // Establece los límites de la cámara para que no se vea fuera del mapa
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        // La cámara principal sigue al jugador
        this.cameras.main.startFollow(this.player);

        // Crea un objeto de cursores para manejar las flechas del teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        // Escucha el evento 'keydown-SPACE' para colocar bombas
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.player && this.player.isAlive) { // Solo si el jugador está vivo
                this.player.tryPlaceBomb();
            }
        });
    }

    /**
     * Método auxiliar para obtener un tile en una posición de coordenadas del mundo.
     * Útil para verificar si una bomba se puede colocar o si una explosión golpea un muro.
     * @param {number} worldX Coordenada X en el mundo.
     * @param {number} worldY Coordenada Y en el mundo.
     * @returns {Phaser.Tilemaps.Tile|null} El tile encontrado o null si no hay ninguno.
     */
    getTileAtWorldXY(worldX, worldY) {
        // Verifica si hay un tile en las capas de muros indestructibles o destructibles en las coordenadas dadas
        const wallTile = this.wallsLayer.getTileAtWorldXY(worldX, worldY, true);
        const destructibleTile = this.destructibleLayer.getTileAtWorldXY(worldX, worldY, true);

        // Devuelve el primer tile encontrado (priorizando muros si ambos estuvieran)
        return wallTile || destructibleTile;
    }
}