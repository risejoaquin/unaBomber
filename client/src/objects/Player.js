import Phaser from 'phaser';

// La clase debe ser exportada por defecto, sin errores de sintaxis
export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        // Adición a la escena y a las físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuración física
        if (this.body) {
            this.body.setCollideWorldBounds(true);
            this.body.setSize(12, 12); // Área de colisión reducida
        }

        this.speed = 150;
    }

    update(time, delta) {
        if (!this.body || !this.scene.cursors) return;

        this.body.setVelocity(0);

        // Movimiento (usa los cursores de la escena, que se inicializan en GameScene.js)
        if (this.scene.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.setFlipX(true);
        } else if (this.scene.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.setFlipX(false);
        }

        if (this.scene.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
        } else if (this.scene.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
        }

        // Normalización para velocidad constante en diagonal
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.body.velocity.normalize().scale(this.speed);
        }
    }
}