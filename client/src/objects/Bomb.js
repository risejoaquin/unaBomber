import Phaser from 'phaser';
import Explosion from './Explosion.js'; // Necesario para la lógica de la explosión

/**
 * Bomb: Representa una bomba colocada por el jugador.
 * Gestiona su temporizador y la creación de las explosiones.
 */
export default class Bomb extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // 'bomb_sprite' es la KEY del spritesheet de la bomba
        super(scene, x, y, 'bomb_sprite');
        // Las bombas se gestionan a través de un grupo, no se añaden directamente aquí
    }

    /**
     * Inicializa y activa la bomba cuando se obtiene del pool.
     * @param {number} scaleFactor El factor de escalado de la escena.
     */
    place(scaleFactor) {
        this.setActive(true);    // Hace que la bomba esté activa en el grupo
        this.setVisible(true);   // La hace visible
        this.setScale(scaleFactor); // Aplica la escala global
        this.body.enable = true; // Activa su cuerpo de físicas
        this.body.setImmovable(true); // Impide que la bomba sea movida por colisiones

        // Temporizador para la explosión (3 segundos, estándar de Bomberman)
        this.scene.time.delayedCall(3000, () => {
            this.explode(); // Llama al método explode cuando el temporizador termina
        });

        // Aquí se pueden iniciar animaciones (ej. this.anims.play('bomb_ticking'))
    }

    /**
     * Lógica para cuando la bomba explota.
     * Crea objetos Explosion en su área de efecto.
     */
    explode() {
        if (!this.active) return; // Evita que una bomba explote si ya ha sido desactivada

        console.log('Bomba explota en', this.x, this.y);

        // Desactiva la bomba, la oculta y deshabilita sus físicas para reciclarla en el pool
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;

        // Crea una explosión central
        this.createExplosionAt(this.x, this.y);

        // Lógica de expansión de la explosión en cruz (estilo Bomberman)
        const range = 2; // Rango de la explosión en número de tiles desde el centro
        const scale = this.scene.SCALE_FACTOR;
        const tileSize = this.scene.TILE_SIZE * scale; // Tamaño del tile escalado

        // Direcciones cardinales para la expansión
        const directions = [
            { x: 0, y: -1 }, // Arriba
            { x: 0, y: 1 },  // Abajo
            { x: -1, y: 0 }, // Izquierda
            { x: 1, y: 0 }   // Derecha
        ];

        directions.forEach(dir => {
            for (let i = 1; i <= range; i++) {
                // Calcula las coordenadas del siguiente tile en la dirección actual
                const targetX = this.x + (dir.x * tileSize * i);
                const targetY = this.y + (dir.y * tileSize * i);

                // Usa el método de GameScene para verificar qué hay en el tile objetivo
                const tile = this.scene.getTileAtWorldXY(targetX, targetY);

                if (tile && tile.collides) {
                    // Si es un bloque destructible ('kitkat'), crea una explosión y detiene la propagación en esa dirección
                    if (tile.layer.name === 'kitkat') {
                        this.createExplosionAt(targetX, targetY);
                    }
                    // Si es un muro indestructible ('walls') o ya se destruyó un kitkat, la explosión se detiene en este punto
                    break;
                }

                // Si el tile está vacío (o no es un muro sólido), crea la explosión y continúa el rango
                this.createExplosionAt(targetX, targetY);
            }
        });
    }

    /**
     * Método auxiliar para obtener una explosión del pool y activarla.
     * @param {number} x Coordenada X del mundo para la explosión.
     * @param {number} y Coordenada Y del mundo para la explosión.
     */
    createExplosionAt(x, y) {
        // Obtiene una Explosion del pool de la GameScene
        const explosion = this.scene.explosionsGroup.get(x, y);
        if (explosion) {
            explosion.fire(this.scene.SCALE_FACTOR); // Inicializa la explosión
        }
    }
}