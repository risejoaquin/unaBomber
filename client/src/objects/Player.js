import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey = 'player_sprite') { // textureKey ahora es 'player_sprite' por defecto
        super(scene, x, y, textureKey); // Usar textureKey pasado

        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (this.body) {
            this.body.setCollideWorldBounds(true);
            this.body.setSize(12, 12); // Área de colisión reducida
            this.body.setOffset(2, 4); // Centrar el cuerpo
        }

        this.speed = 150;
        this.setDepth(10); // Para asegurar que el jugador siempre se vea por encima del mapa
    }

    update(time, delta) {
        // Asegúrate de que el cuerpo físico y los cursores existan
        if (!this.body || !this.scene.cursors) return;

        this.body.setVelocity(0); // Reiniciar velocidad en cada frame

        // Movimiento (usa los cursores de la escena)
        if (this.scene.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.setFlipX(true); // Voltear sprite si va a la izquierda
        } else if (this.scene.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.setFlipX(false); // No voltear si va a la derecha
        }

        if (this.scene.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
        } else if (this.scene.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
        }

        // Normalización para velocidad constante en diagonal (evita ir más rápido)
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.body.velocity.normalize().scale(this.speed);
        }
    }
}