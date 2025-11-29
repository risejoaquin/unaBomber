import Phaser from 'phaser';

/**
 * Enemy: Representa un enemigo en el juego. Sin factor de escalado.
 */
export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy_sprite');
        this.speed = 80;
        this.direction = Phaser.Math.Between(0, 3); // Dirección inicial aleatoria
        this.isAlive = false;
    }

    init() {
        this.isAlive = true;
        this.setActive(true);
        this.setVisible(true);
        // ¡ATENCIÓN! No hay setScale() aquí para el enemigo.
        this.body.enable = true;
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1); // Hace que el enemigo rebote contra los muros
        this.setTint(0xffffff); // Color normal

        this.changeDirection();
    }

    update(time, delta) {
        if (!this.active || !this.isAlive) return;

        // Movimiento simple del enemigo
        if (this.direction === 0) { // Arriba
            this.body.setVelocity(0, -this.speed);
        } else if (this.direction === 1) { // Abajo
            this.body.setVelocity(0, this.speed);
        } else if (this.direction === 2) { // Izquierda
            this.body.setVelocity(-this.speed, 0);
            this.setFlipX(true);
        } else if (this.direction === 3) { // Derecha
            this.body.setVelocity(this.speed, 0);
            this.setFlipX(false);
        }

        // Si el enemigo se detiene (por alguna razón inesperada, aunque el rebote debería evitarlo)
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.changeDirection(); // Cambia de dirección
        }
    }

    changeDirection() {
        this.direction = Phaser.Math.Between(0, 3); // Elige una nueva dirección aleatoria
    }

    die() {
        if (!this.isAlive) return;

        console.log('Enemigo destruido');
        this.isAlive = false;
        this.body.enable = false;
        this.setTint(0x555555); // Color gris para indicar muerte

        this.scene.time.delayedCall(1000, () => {
            this.setActive(false);
            this.setVisible(false);
        });
    }
}