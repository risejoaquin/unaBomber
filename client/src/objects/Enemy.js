import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy_sprite');
        this.speed = 80;
        this.direction = Phaser.Math.Between(0, 3);
        this.isAlive = false;
    }

    init() {
        this.isAlive = true;
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1); // Hace que rebote contra muros
        this.setTint(0xffffff); // Color normal

        this.changeDirection();
    }

    update(time, delta) {
        if (!this.active || !this.isAlive) return;

        // Movimiento simple por dirección
        if (this.direction === 0) this.body.setVelocity(0, -this.speed);
        else if (this.direction === 1) this.body.setVelocity(0, this.speed);
        else if (this.direction === 2) this.body.setVelocity(-this.speed, 0);
        else if (this.direction === 3) this.body.setVelocity(this.speed, 0);

        // Si se detiene por colisión, cambia de dirección
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.changeDirection();
        }
    }

    changeDirection() {
        // Elige una nueva dirección aleatoria
        this.direction = Phaser.Math.Between(0, 3);
    }

    die() {
        if (!this.isAlive) return;
        console.log('Enemigo destruido');
        this.isAlive = false;
        this.body.enable = false;
        this.setTint(0x555555); // Feedback de muerte

        // Desaparecer después de 1 segundo
        this.scene.time.delayedCall(1000, () => {
            this.setActive(false);
            this.setVisible(false);
        });
    }
}