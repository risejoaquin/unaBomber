import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Carga tus imágenes para el mapa y los personajes aquí
        this.load.image('tileset', 'assets/tilesets/dungeon_tileset.png'); // Asegúrate de que esta ruta sea correcta
        this.load.tilemapTiledJSON('map_levels', 'assets/maps/level1.json'); // Asegúrate de que esta ruta sea correcta

        // Carga el sprite del jugador (o cualquier otro personaje/objeto que aparezca temprano)
        this.load.spritesheet('player', 'assets/sprites/player.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('seal', 'assets/sprites/seal.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('enemy', 'assets/sprites/enemy.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        // Carga cualquier otro asset necesario para el juego (botones, UI, etc.)
        // this.load.image('button', 'assets/ui/button.png');
    }

    create() {
        // Una vez que todos los assets están cargados, inicia la escena principal del juego
        this.scene.start('GameScene');
    }
}