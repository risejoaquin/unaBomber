export class Explosion {
    constructor(scene, x, y, range) {
        this.scene = scene;
        this.damageGroup = scene.physics.add.staticGroup();

        // Tamaño de cada paso de la explosión (3 tiles de 16px = 48px)
        const TILE_SIZE = 48;

        // 1. Crear el fuego central
        this.createFire(x, y);

        // 2. Expandir en las 4 direcciones: [x, y]
        // Arriba, Abajo, Izquierda, Derecha
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        directions.forEach(dir => {
            for (let i = 1; i <= range; i++) {
                // Calcular dónde va el siguiente fuego
                const checkX = x + (dir[0] * i * TILE_SIZE);
                const checkY = y + (dir[1] * i * TILE_SIZE);

                // --- RAYCAST (Detectar Muros) ---
                // Preguntamos al mapa: ¿Qué hay en estas coordenadas?
                const tile = scene.wallsLayer.getTileAtWorldXY(checkX, checkY);

                if (tile) {
                    if (tile.index === 1) {
                        // ID 1 = Muro Duro (Indestructible)
                        // El fuego choca y se detiene. No dibujamos nada aquí.
                        break;
                    }
                    if (tile.index === 2) {
                        // ID 2 = Caja (Destructible)
                        // Dibujamos el fuego AQUÍ (para que se vea que explota la caja)
                        this.createFire(checkX, checkY);

                        // BORRAMOS LA CAJA DEL MAPA
                        scene.wallsLayer.removeTileAt(tile.x, tile.y);

                        // El fuego se detiene después de romper la caja
                        break;
                    }
                }

                // Si no hay obstáculo, el fuego avanza libremente
                this.createFire(checkX, checkY);
            }
        });

        // 3. Limpieza: Desaparecer el fuego después de medio segundo
        scene.time.delayedCall(500, () => {
            // Borrar todos los rectángulos de fuego
            this.damageGroup.clear(true, true);
        });
    }

    createFire(x, y) {
        // Crear un cuadrado de energía "Cian Neón" (Color: 0x00ffff)
        const fire = this.scene.add.rectangle(x, y, 40, 40, 0x00ffff);

        // Efecto visual: un poco transparente
        fire.setAlpha(0.8);

        // Añadir físicas (para matar enemigos en el futuro)
        this.scene.physics.add.existing(fire, true);
        this.damageGroup.add(fire);

        this.scene.physics.add.overlap(fire, this.scene.enemies, (fireObj, enemy) => {
            // Efecto visual de muerte (pequeño tween)
            enemy.setTint(0xff0000);
            this.scene.tweens.add({
                targets: enemy,
                alpha: 0,
                scale: 0,
                duration: 200,
                onComplete: () => {
                    enemy.destroy(); // Adiós enemigo
                }
            });
        });

        // Animación: Desvanecerse suavemente
        this.scene.tweens.add({
            targets: fire,
            alpha: 0,
            duration: 500
        });
    }
}