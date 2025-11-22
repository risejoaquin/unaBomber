// client/src/objects/Player.js
import Phaser from 'phaser'; // <<-- ¡AÑADIR ESTO SI NO ESTÁ!

// ASEGÚRATE DE QUE LA CLASE Player ESTÁ EXPORTADA POR DEFECTO
export default class Player extends Phaser.GameObjects.Sprite { // <<-- ¡CAMBIAR A 'export default'!
    constructor(scene, x, y, texture = 'player', frame = 0) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.body.setCollideWorldBounds(true);
        this.body.setSize(this.width * 0.8, this.height * 0.8); // Ajustar el tamaño del cuerpo de colisión
        this.setDepth(10); // Para que esté por encima de otros objetos

        // Inicializar las animaciones del jugador (si las tienes)
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }), // Asumiendo un frame para idle
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player_walk',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }), // Ajusta los frames si tienes una animación de caminar
            frameRate: 10,
            repeat: -1
        });

        // Teclado
        this.cursors = scene.input.keyboard.createCursorKeys();

        this.speed = 100; // Velocidad del jugador
    }

    update(time, delta) {
        this.body.setVelocity(0); // Reiniciar velocidad en cada frame

        // Movimiento horizontal
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.setFlipX(true); // Voltear sprite hacia la izquierda
        } else if (this.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.setFlipX(false); // No voltear sprite (hacia la derecha)
        }

        // Movimiento vertical
        if (this.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
        } else if (this.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
        }

        // Normalizar velocidad para movimiento diagonal
        this.body.velocity.normalize().scale(this.speed);

        // Animaciones
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.play('player_walk', true);
        } else {
            this.play('player_idle', true);
        }
    }
}