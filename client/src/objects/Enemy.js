import Phaser from 'phaser';

/**
 * Enemy: Representa un enemigo en el juego.
 * Implementa una IA de movimiento básica y su ciclo de vida (morir/desactivarse).
 */
export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // 'enemy_sprite' es la KEY del spritesheet del enemigo
        super(scene, x, y, 'enemy_sprite');
        // Los enemigos se gestionan a través de un grupo
        this.speed = 80; // Velocidad de movimiento del enemigo
        this.direction = Phaser.Math.Between(0, 3); // Dirección inicial aleatoria (0: arriba, 1: abajo, 2: izquierda, 3: derecha)
        this.isAlive = false; // Estado de vida del enemigo
    }

    /**
     * Inicializa el enemigo cuando se obtiene del pool.
     */
    init() {
        this.isAlive = true;
        this.setActive(true);    // Activa el enemigo en el grupo
        this.setVisible(true);   // Lo hace visible
        this.body.enable = true; // Activa su cuerpo de físicas
        this.body.setCollideWorldBounds(true); // El enemigo no puede salir de los límites del mundo
        this.body.setBounce(1);  // Hace que el enemigo rebote completamente contra los muros
        this.setTint(0xffffff);  // Restaura el color normal del sprite (sin tintes de daño)

        this.changeDirection(); // Establece una dirección inicial de movimiento
    }

    /**
     * El método update se llama automáticamente en cada fotograma del juego.
     * Implementa la lógica de movimiento del enemigo.
     */
    update(time, delta) {
        if (!this.active || !this.isAlive) return; // Si no está activo o no está vivo, no actualiza

        // Lógica de movimiento simple: el enemigo se mueve en una dirección constante
        // hasta que choca y rebota o se implementa una IA más compleja.
        if (this.direction === 0) { // Arriba
            this.body.setVelocity(0, -this.speed);
        } else if (this.direction === 1) { // Abajo
            this.body.setVelocity(0, this.speed);
        } else if (this.direction === 2) { // Izquierda
            this.body.setVelocity(-this.speed, 0);
            this.setFlipX(true); // Gira el sprite a la izquierda
        } else if (this.direction === 3) { // Derecha
            this.body.setVelocity(this.speed, 0);
            this.setFlipX(false); // Restaura el sprite a la derecha
        }

        // Si el enemigo se detiene (por ejemplo, al quedar atascado entre paredes, aunque el bounce lo evita mayormente)
        // cambia de dirección aleatoriamente como una IA de fallback.
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.changeDirection();
        }
    }

    /**
     * Cambia la dirección de movimiento del enemigo a una dirección cardinal aleatoria.
     */
    changeDirection() {
        this.direction = Phaser.Math.Between(0, 3); // Elige una nueva dirección (0-3)
    }

    /**
     * Lógica para cuando el enemigo es destruido.
     */
    die() {
        if (!this.isAlive) return; // Evita morir varias veces

        console.log('Enemigo destruido');
        this.isAlive = false;
        this.body.enable = false; // Desactiva las físicas
        this.setTint(0x555555);   // Cambia el color del sprite a gris como feedback visual

        // Espera un tiempo (ej. 1 segundo) antes de desactivar completamente el enemigo
        // para que pueda ser reciclado por el pool.
        this.scene.time.delayedCall(1000, () => {
            this.setActive(false); // Desactiva el objeto en el grupo
            this.setVisible(false); // Lo oculta
        });
    }
}
