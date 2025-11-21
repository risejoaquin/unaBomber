export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log('--> BootScene: Cargando recursos...');

        // 1. Mapas
        this.load.tilemapTiledJSON('map_level1', 'assets/maps/level1.json');

        // 2. Tileset (La imagen de los cuadritos)
        this.load.image('tileset_img', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');

        // 3. Héroe (Kuroro)
        this.load.image('hero', 'assets/sprites/hero.png');

        // 4. Sello/Bomba (La Calavera)
        this.load.image('seal_sprite', 'assets/sprites/skull.png');

        // 5. Carga imagen de enemigos.
        this.load.image('enemy', 'assets/sprites/enemy.png');

    }

    create() {
        console.log('--> BootScene: Carga completa. Iniciando GameScene...');
        this.scene.start('GameScene');
    }
}