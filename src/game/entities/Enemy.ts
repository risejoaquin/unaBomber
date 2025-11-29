import Phaser from 'phaser';

export class Enemy {
  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private sceneRef: Phaser.Scene;

  private speed: number = 80;
  private currentDir: Phaser.Math.Vector2;
  private moveTimer: number = 0;
  private _isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sceneRef = scene;

    // Crear Sprite (32px nativo)
    this.sprite = scene.physics.add.sprite(x, y, 'enemy');

    // HITBOX AJUSTADA (24px para evitar atascos en pasillos de 32px)
    this.sprite.body.setSize(24, 24);
    this.sprite.body.setOffset(4, 4);

    this.sprite.setCollideWorldBounds(true);
    this.sprite.setData('owner', this);

    this.currentDir = this.getRandomDirection();
    this.playAnimationForDirection();
  }

  public getSprite() { return this.sprite; }
  public isDead() { return this._isDead; }

  public update(delta: number) {
    if (this._isDead || !this.sprite.body) return;

    // Aplicar velocidad constante
    this.sprite.setVelocity(
      this.currentDir.x * this.speed,
      this.currentDir.y * this.speed
    );

    this.playAnimationForDirection();

    // LÓGICA DE IA MEJORADA
    // 1. Cambiar dirección si choca contra algo (pared o bomba)
    if (this.sprite.body.blocked.down || this.sprite.body.blocked.up ||
      this.sprite.body.blocked.left || this.sprite.body.blocked.right) {
      this.changeDirection();
    }

    // 2. Cambiar dirección aleatoriamente cada cierto tiempo
    this.moveTimer += delta;
    if (this.moveTimer > 2000) {
      if (Math.random() > 0.5) this.changeDirection();
      this.moveTimer = 0;
    }
  }

  public die() {
    if (this._isDead) return;
    this._isDead = true;

    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0xff0000);
    this.sprite.anims.stop();
    // CORRECCIÓN: Desactivar cuerpo físico inmediatamente
    this.sprite.disableBody(true, false);

    this.sceneRef.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }

  private changeDirection() {
    // Intentar una dirección distinta a la actual para no rebotar 180 grados siempre
    let newDir = this.getRandomDirection();
    // Simple intento de no repetir dirección inmediatamente (opcional)
    while (newDir.x === this.currentDir.x && newDir.y === this.currentDir.y) {
      newDir = this.getRandomDirection();
    }
    this.currentDir = newDir;
  }

  private playAnimationForDirection() {
    if (!this.sprite.anims) return;

    const vel = this.sprite.body.velocity;
    // Solo animar si se mueve
    if (vel.length() < 0.1) return;

    if (Math.abs(vel.x) > Math.abs(vel.y)) {
      if (vel.x > 0) {
        this.sprite.play('enemy_right', true).setFlipX(false);
      } else {
        // CORRECCIÓN: Usar enemy_right y setFlipX(true) para ir a la izquierda (assets compartidos)
        this.sprite.play('enemy_right', true).setFlipX(true);
      }
    } else {
      if (vel.y > 0) this.sprite.play('enemy_down', true).setFlipX(false);
      else this.sprite.play('enemy_up', true).setFlipX(false);
    }
  }

  private getRandomDirection(): Phaser.Math.Vector2 {
    const dirs = [
      new Phaser.Math.Vector2(0, -1), // Arriba
      new Phaser.Math.Vector2(0, 1),  // Abajo
      new Phaser.Math.Vector2(-1, 0), // Izquierda
      new Phaser.Math.Vector2(1, 0)   // Derecha
    ];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }
}