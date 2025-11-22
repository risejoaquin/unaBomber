import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Seal from '../objects/Seal.js';
import Enemy from '../objects/Enemy.js';
import Explosion from '../objects/Explosion.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.wallsLayer = null;
        this.staticObjectsLayer = null;
        this.kitkatLayer = null;
    }

    create() {
        console.log("--- GameScene: INICIO de creación de escena ---");
        const SCALE_FACTOR = 3;

        // --- 1. CONFIGURACIÓN DEL MAPA ---
        // Intentamos crear el mapa. Si BootScene dijo que cargó, debería funcionar.
        const map = this.make.tilemap({ key: 'level1_map' });

        // ¡QUITADO el 'return' temprano! Si map es null aquí, GameScene fallará de otras maneras.
        // Pero el 'setScale' no debería ser el primer punto de fallo si la carga fue exitosa.
        if (!map) {
            console.error("ERROR CRÍTICO (GameScene): this.make.tilemap() devolvió NULL a pesar de la carga exitosa en BootScene. Revisa el formato de level1.json.");
            // Podrías lanzar un error real o volver a la escena de carga aquí.
            // Por ahora, continuaremos para ver dónde más falla si 'map' es realmente null.
        }

        // Tiled Name: '0x72_DungeonTilesetII_v1.7' (del JSON de Tiled)
        // Image Key: 'dungeon_tileset' (lo que cargamos en BootScene)
        const tileset = map.addTilesetImage('0x72_DungeonTilesetII_v1.7', 'dungeon_tileset');

        if (!tileset) {
            console.error("ERROR CRÍTICO (GameScene): La conexión Tileset-Imagen falló. Revisa que el nombre del tileset en Tiled sea '0x72_DungeonTilesetII_v1.7' Y que el key 'dungeon_tileset' esté bien.");
            return; // Si el tileset no se puede añadir, no podemos crear capas.
        }

        // Aquí es donde se producía el error. Asegurémonos de que 'map' no sea null aquí.
        // Si 'map' es null AQUI, entonces el error original de 'make.tilemap' es el problema.
        if (map) { // Aseguramos que 'map' exista antes de llamarle a .setScale()
            map.setScale(SCALE_FACTOR); // Escalamos el mapa completo
        } else {
            console.error("ERROR CRÍTICO (GameScene): 'map' sigue siendo null después de this.make.tilemap(). No se puede escalar.");
            return; // No podemos continuar si no tenemos un mapa válido
        }

        // --- 2. CREACIÓN DE CAPAS DEL MAPA ---
        // Si 'map' es null en este punto, estas líneas fallarían.
        this.groundLayer = map.createLayer('ground', tileset, 0, 0);
        this.wallsLayer = map.createLayer('walls', tileset, 0, 0);
        this.staticObjectsLayer = map.createLayer('static_objects', tileset, 0, 0);
        this.kitkatLayer = map.createLayer('kitkat', tileset, 0, 0); // Tu capa adicional

        // Configurar colisiones para las capas que deben ser sólidas
        this.wallsLayer.setCollisionByProperty({ collides: true });
        this.staticObjectsLayer.setCollisionByProperty({ collides: true });
        this.kitkatLayer.setCollisionByProperty({ collides: true });


        // --- 3. CREACIÓN DEL JUGADOR ---
        const TILE_SIZE = 16;
        const startX = 5 * TILE_SIZE * SCALE_FACTOR;
        const startY = 5 * TILE_SIZE * SCALE_FACTOR;

        this.player = new Player(this, startX, startY, 'player_sprite');
        this.player.setScale(SCALE_FACTOR);

        if (!this.player || !this.player.body) {
            console.error("ERROR CRÍTICO (GameScene): Player no se pudo crear o no tiene cuerpo físico.");
            return;
        }


        // --- 4. COLISIONES FÍSICAS ---
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.staticObjectsLayer);
        this.physics.add.collider(this.player, this.kitkatLayer);


        // --- 5. CÁMARA Y CONTROLES ---
        const worldWidth = map.widthInPixels * SCALE_FACTOR;
        const worldHeight = map.heightInPixels * SCALE_FACTOR;

        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);
        this.cursors = this.input.keyboard.createCursorKeys();

        console.log("--- GameScene: FIN de creación de escena. Buscando inputs. ---");
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(time, delta);
        }
    }
}