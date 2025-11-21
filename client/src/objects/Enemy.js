export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- APARIENCIA ---
        this.setScale(3);
        this.setTint(0x00ff00); // Un tinte verdoso tóxico (opcional)

        // --- FÍSICAS ---
        this.body.setSize(12, 12);
        this.body.setOffset(2, 18); // Ajustar hitbox
        this.setCollideWorldBounds(true);

        // --- MOVIMIENTO INICIAL ---
        this.speed = 100;
        this.changeDirection();

        // Evento para cambiar dirección si choca contra muros
        this.body.onWorldBounds = true;
    }

    changeDirection() {
        // Elegir una dirección al azar: 0=Arr, 1=Aba, 2=Izq, 3=Der
        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        const dir = Phaser.Utils.Array.GetRandom(directions);
        this.setVelocity(dir.x * this.speed, dir.y * this.speed);

        // Voltear sprite si va a la izquierda
        if (dir.x < 0) this.setFlipX(true);
        else if (dir.x > 0) this.setFlipX(false);
    }

    update() {
        // Si se queda quieto (se atoró), cambiar dirección
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.changeDirection();
        }
    }
}