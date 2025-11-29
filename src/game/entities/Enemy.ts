import Phaser from 'phaser';

export class Enemy {
  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private sceneRef: Phaser.Scene;
  private targetPlayer: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody; // 👈 NUEVO: Referencia al jugador

  private maxLeashDistance: number = 300; // Distancia máxima antes de forzar el regreso
  private speed: number = 80;
  private currentDir: Phaser.Math.Vector2;
  private moveTimer: number = 0;
  private _isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) { // 👈 NUEVO: Recibe el jugador
    this.sceneRef = scene;
    this.targetPlayer = player; // Asigna la referencia del jugador

    // Crear Sprite (32px nativo)
    this.sprite = scene.physics.add.sprite(x, y, 'enemy');

    // HITBOX AJUSTADA (24px para evitar atascos en pasillos de 32px)
    this.sprite.body.setSize(24, 24);
    this.sprite.body.setOffset(4, 4);

    // setBounce(1) es la última línea de defensa contra salirse del mapa
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(1);
    this.sprite.body.onWorldBounds = true;

    this.sprite.setData('owner', this);

    this.currentDir = this.getRandomDirection();
    this.playAnimationForDirection();
  }

  public getSprite() { return this.sprite; }
  public isDead() { return this._isDead; }
  public changeDirection() {
    let newDir = this.getRandomDirection();
    while (newDir.x === this.currentDir.x && newDir.y === this.currentDir.y) {
      newDir = this.getRandomDirection();
    }
    this.currentDir = newDir;
  }

  public update(delta: number) {
    if (this._isDead || !this.sprite.body || !this.targetPlayer) return;

    // 1. ✅ LÓGICA DE IA DE PROXIMIDAD (LEASH)
    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPlayer.x, this.targetPlayer.y);
    let velocityX = 0;
    let velocityY = 0;

    if (distance > this.maxLeashDistance) {
      // Forzar al enemigo a moverse hacia el jugador
      this.sceneRef.physics.moveToObject(this.sprite, this.targetPlayer, this.speed);
      velocityX = this.sprite.body.velocity.x;
      velocityY = this.sprite.body.velocity.y;
    } else {
      // Movimiento normal (random walk)
      if (this.currentDir.x !== 0) velocityX = this.currentDir.x * this.speed;
      if (this.currentDir.y !== 0) velocityY = this.currentDir.y * this.speed;

      this.sprite.setVelocity(velocityX, velocityY);
    }

    this.playAnimationForDirection();

    // 2. Lógica de IA: Cambiar dirección si choca o por temporizador
    if (this.sprite.body.blocked.down || this.sprite.body.blocked.up ||
      this.sprite.body.blocked.left || this.sprite.body.blocked.right) {
      this.changeDirection();
    }

    this.moveTimer += delta;
    if (this.moveTimer > 2000 && distance <= this.maxLeashDistance) {
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

  private playAnimationForDirection() {
    if (!this.sprite.anims || !this.sprite.body) return;

    const vel = this.sprite.body.velocity;
    if (vel.length() < 0.1) return;

    if (Math.abs(vel.x) > Math.abs(vel.y)) {
      if (vel.x > 0) {
        this.sprite.play('enemy_right', true).setFlipX(false);
      } else {
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