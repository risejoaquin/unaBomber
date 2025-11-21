// client/src/scenes/GameScene.js
export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // --- 1. CREAR EL MAPA ---
        // Usamos el apodo del JSON definido en BootScene
        const map = this.make.tilemap({ key: 'map_level1' });

        // VINCULAR IMAGEN AL JSON (Aquí estaba tu error probable)
        // 1er parámetro: 'dungeon_tiles' (Es el nombre que está ESCRITO DENTRO del archivo level1.json)
        // 2do parámetro: 'tileset_img' (Es el apodo que definimos en BootScene.js)
        const tileset = map.addTilesetImage('dungeon_tiles', 'tileset_img');

        // CREAR LA CAPA VISUAL
        // 1er parámetro: 'ground' (Es el nombre de la capa ESCRITO DENTRO del level1.json)
        this.wallsLayer = map.createLayer('ground', tileset, 0, 0);

        // Escalar el mapa para que se vea más grande (x3)
        this.wallsLayer.setScale(3);

        // DEFINIR COLISIONES
        // Los tiles con ID 1 (muro duro) y 2 (caja) serán sólidos.
        this.wallsLayer.setCollision([1, 2]);

        // --- 2. CREAR AL JUGADOR (Kuroro) ---
        // Lo ponemos en una posición inicial segura
        // Usamos el apodo 'hero' definido en BootScene
        this.player = this.physics.add.sprite(100, 100, 'hero');
        this.player.setScale(3); // Escalar al héroe igual que el mapa

        // Ajustar la caja de colisión (hitbox) para que sea más pequeña en los pies
        this.player.body.setSize(12, 14);
        this.player.body.setOffset(2, 16);

        // Evitar que salga de la pantalla
        this.player.setCollideWorldBounds(true);

        // --- 3. ACTIVAR CHOQUES ---
        // El jugador chocará con la capa de muros
        this.physics.add.collider(this.player, this.wallsLayer);

        // --- 4. ACTIVAR TECLADO ---
        this.cursors = this.input.keyboard.createCursorKeys();

        // --- 5. CÁMARA (Opcional, para seguir al jugador si el mapa es grande) ---
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 3, map.heightInPixels * 3);
    }

    update() {
        // --- BUCLE PRINCIPAL DEL JUEGO (Control de movimiento) ---

        if (!this.player || !this.cursors) return;

        const speed = 200; // Velocidad de movimiento

        // Resetear velocidad en cada frame para que se detenga si no tocas nada
        this.player.setVelocity(0);

        // Movimiento Horizontal
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true); // Mirar a la izquierda
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false); // Mirar a la derecha
        }

        // Movimiento Vertical
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Normalizar velocidad diagonal (para que no corra más rápido en diagonal)
        this.player.body.velocity.normalize().scale(speed);
    }
}