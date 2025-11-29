import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Item, ItemType } from '../entities/Item';
import { Portal } from '../entities/Portal';
import { GameAction, PlayerSessionData, ActionType, XP_VALUES } from '../../core/progression/XPSystemTypes';

// NOTA: Los assets se cargarán desde /public/assets/ (debido a la corrección de ruta)

const BRICK_TILE_ID = 449; // ID del tileset para mostrar la caja de madera destructible.
let GAME_START_TIME = Date.now(); // Rastreador de tiempo global

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private isPlayerDead: boolean = false;
  private isLevelComplete: boolean = false;
  private portalSpawned: boolean = false;
  private gameEnded: boolean = false;

  private currentLevel: number = 1;
  private playerSpeed: number = 160;
  private bombRange: number = 1;
  private maxBombs: number = 1;
  private currentBombs: number = 0;
  private score: number = 0;
  private lives: number = 3;
  private deaths: number = 0;

  // AÑADIDO: XP de la sesión actual (local) y objeto de texto del HUD
  private currentSessionXP: number = 0;
  private statusText!: Phaser.GameObjects.Text;

  private map!: Phaser.Tilemaps.Tilemap;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer | null;

  private portal!: Portal;
  private enemiesList: Enemy[] = [];

  private bricksLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private bombs!: Phaser.Physics.Arcade.Group;
  private explosionGroup!: Phaser.Physics.Arcade.Group;
  private itemsGroup!: Phaser.Physics.Arcade.Group;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;

  private MAP_WIDTH = 25;
  private MAP_HEIGHT = 19;

  private sessionActions: GameAction[] = [];
  private lastMovementReport: number = 0;
  private addSessionXP!: (data: PlayerSessionData) => Promise<number>;

  constructor() {
    super('GameScene');
  }

  init(data: { difficulty: string, level?: number, score?: number, lives?: number, bombs?: number, speed?: number, range?: number, addSessionXP?: (data: PlayerSessionData) => Promise<number> }) {
    if (data.difficulty === 'medium' && !data.speed) this.playerSpeed = 180;
    if (data.difficulty === 'hard' && !data.speed) this.playerSpeed = 250;

    this.currentLevel = data.level || 1;
    this.score = data.score || 0;
    this.lives = data.lives !== undefined ? data.lives : 3;
    this.maxBombs = data.bombs || 1;
    this.playerSpeed = data.speed || 160;
    this.bombRange = data.range || 1;

    if (data.addSessionXP) {
      this.addSessionXP = data.addSessionXP;
    }

    this.isPlayerDead = false;
    this.isLevelComplete = false;
    this.portalSpawned = false;
    this.currentBombs = 0;
    this.deaths = 0;

    this.sessionActions = [];
    this.gameEnded = false;
    GAME_START_TIME = Date.now();
    this.currentSessionXP = 0; // Reset XP on level restart
  }

  preload() {
    // ... (Carga de assets)
    this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('enemy', 'assets/sprites/enemy.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('bomb', 'assets/sprites/bomb.png');
    this.load.image('portal', 'assets/sprites/portal.png');

    this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
    this.load.tilemapTiledJSON('level2', 'assets/maps/level2.json');
    this.load.image('tiles', 'assets/maps/tileset.png');

    this.load.image('item_range', 'assets/items/powerup_range.png');
    this.load.image('item_speed', 'assets/items/powerup_speed.png');
    this.load.image('item_bomb', 'assets/items/powerup_bomb.png');

    this.load.audio('bgm', 'assets/sounds/bgm.mp3');
    this.load.audio('sfx_bomb', 'assets/sounds/place_bomb.wav');
    this.load.audio('sfx_explode', 'assets/sounds/explosion.mp3');
    this.load.audio('sfx_powerup', 'assets/sounds/powerup.wav');
  }

  create() {
    this.sound.stopAll();
    this.sound.play('bgm', { loop: true, volume: 0.3 });

    this.bombs = this.physics.add.group();
    this.explosionGroup = this.physics.add.group();
    this.enemiesGroup = this.physics.add.group();
    this.itemsGroup = this.physics.add.group();
    this.enemiesList = [];

    const levelKey = `level${this.currentLevel}`;
    const mapKey = this.cache.tilemap.exists(levelKey) ? levelKey : 'level1';
    this.map = this.make.tilemap({ key: mapKey });

    this.MAP_WIDTH = this.map.width;
    this.MAP_HEIGHT = this.map.height;

    let tileset: Phaser.Tilemaps.Tileset | null = null;
    if (this.map.tilesets.length > 0) {
      const tilesetName = this.map.tilesets[0].name;
      tileset = this.map.addTilesetImage(tilesetName, 'tiles');
      if (tileset) {

        // CORRECCIÓN FINAL: Usar el valor numérico 1 (NEAREST) para el filtro de textura.
        // Esto resuelve el TypeError y asegura el renderizado de pixel art.
        this.textures.get('tiles').setFilter(1); // 1 es el valor numérico para NEAREST

        const floorLayer = this.map.layers.find(l => l.name.toLowerCase().includes('floor') || l.name.toLowerCase().includes('suelo'));
        if (floorLayer) {
          const layer = this.map.createLayer(floorLayer.name, tileset, 0, 0);
          // Ya no se llama a setSmoothing(false);
        }

        const wallLayer = this.map.layers.find(l => l.name.toLowerCase().includes('wall') || l.name.toLowerCase().includes('muro'));
        if (wallLayer) {
          this.wallsLayer = this.map.createLayer(wallLayer.name, tileset, 0, 0);
          if (this.wallsLayer) {
            this.wallsLayer.setCollisionByExclusion([-1]);
            // Ya no se llama a this.wallsLayer.setSmoothing(false);
          }
        }

        this.bricksLayer = this.generateDestructibles(tileset);
      }
    }

    this.createAnimations();
    this.portal = new Portal(this);

    const px = (1 * 32) + 16;
    const py = (1 * 32) + 16;
    this.player = this.physics.add.sprite(px, py, 'player');
    this.player.body.setSize(20, 20);
    this.player.body.setOffset(6, 12);
    this.player.setCollideWorldBounds(true);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.spawnEnemies(3 + (this.currentLevel * 2));

    if (this.wallsLayer) {
      this.physics.add.collider(this.player, this.wallsLayer);
      this.physics.add.collider(this.enemiesGroup, this.wallsLayer);
    }
    if (this.bricksLayer) {
      this.bricksLayer.setCollisionByExclusion([-1]);
      this.physics.add.collider(this.player, this.bricksLayer);
      this.physics.add.collider(this.enemiesGroup, this.bricksLayer);
    }

    this.physics.add.collider(this.player, this.bombs);
    this.physics.add.collider(this.enemiesGroup, this.bombs);

    this.physics.add.overlap(this.explosionGroup, this.enemiesGroup, this.handleExplosionEnemy, undefined, this);
    if (this.bricksLayer) {
      this.physics.add.overlap(this.explosionGroup, this.bricksLayer, (exp: any, tile: any) => this.handleExplosionTile(tile), undefined, this);
    }
    this.physics.add.overlap(this.explosionGroup, this.itemsGroup, this.handleExplosionItem, undefined, this);

    this.physics.add.overlap(this.player, this.enemiesGroup, this.handlePlayerDeath, undefined, this);
    this.physics.add.overlap(this.player, this.itemsGroup, this.handlePickupItem, undefined, this);
    this.physics.add.overlap(this.player, this.portal.getSprite(), this.handleLevelComplete, undefined, this);

    this.statusText = this.add.text(10, 10, this.getHudText(), {
      fontFamily: 'monospace', fontSize: '16px', color: '#fff', backgroundColor: '#000000aa'
    }).setScrollFactor(0).setDepth(100);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.player.anims.play('turn');
  }

  // FUNCIÓN PARA GENERAR EL TEXTO DEL HUD
  private getHudText(): string {
    return `NIVEL ${this.currentLevel} | VIDAS: ${this.lives} | SCORE: ${this.score} | XP: ${this.currentSessionXP}`;
  }

  update(time: number, delta: number) {
    if (this.isPlayerDead || this.isLevelComplete || this.gameEnded) return;

    this.handlePlayerMovement();
    this.handleBombInput();

    this.enemiesList.forEach(e => e.update(delta));
    this.enemiesList = this.enemiesList.filter(e => !e.isDead());

    if (this.enemiesList.length === 0 && !this.portalSpawned) {
      this.spawnPortalRandomly();
    }

    // ACTUALIZAR EL HUD LOCALMENTE CADA CUADRO
    this.statusText.setText(this.getHudText());
  }

  private trackAction(type: ActionType, data: { entityId?: string, gridX?: number, gridY?: number } = {}) {
    this.sessionActions.push({ type, timestamp: Date.now(), data });
  }

  private async reportSessionEnd(isComplete: boolean) {
    if (this.gameEnded) return;
    this.gameEnded = true;

    if (!this.addSessionXP) return;

    const sessionData: PlayerSessionData = {
      actions: this.sessionActions,
      sessionDurationSeconds: Math.floor((Date.now() - GAME_START_TIME) / 1000),
      deaths: this.deaths
    };

    const awardedXP = await this.addSessionXP(sessionData);

    let message = isComplete ? "¡NIVEL COMPLETADO!" : "GAME OVER";

    this.add.text(400, 350, `XP GANADA: ${awardedXP}`, { fontSize: '24px', color: '#00ff00', stroke: '#000', strokeThickness: 4, fontFamily: 'monospace' }).setOrigin(0.5).setDepth(100);
  }

  // CONVERTIDO A FUNCIÓN FLECHA PARA RESOLVER ERRORES DE CONTEXTO (this.)
  private handleExplosionEnemy = (exp: Phaser.GameObjects.GameObject, enemySprite: Phaser.GameObjects.GameObject) => {
    const sprite = enemySprite as Phaser.Physics.Arcade.Sprite;
    const enemy = sprite.getData('owner') as Enemy;
    if (enemy && !enemy.isDead()) {
      enemy.die();
      this.score += 100;
      this.currentSessionXP += XP_VALUES.ENEMY_KILLED;
      this.trackAction('ENEMY_KILLED', { entityId: enemy.getSprite().name });
    }
  }

  // CONVERTIDO A FUNCIÓN FLECHA PARA RESOLVER ERRORES DE CONTEXTO (this.)
  private handleExplosionTile = (tile: Phaser.Tilemaps.Tile) => {
    if (!tile || tile.index !== BRICK_TILE_ID || !this.bricksLayer) return;

    const x = tile.pixelX + 16;
    const y = tile.pixelY + 16;

    if (this.bricksLayer) {
      this.bricksLayer.removeTileAt(tile.x, tile.y);
      this.currentSessionXP += XP_VALUES.BLOCK_WEAK_DESTROYED;
    }
    this.trackAction('BLOCK_WEAK_DESTROYED', { gridX: tile.x, gridY: tile.y });

    if (Math.random() < 0.5) {
      this.spawnItem(x, y);
    }
  }

  // CONVERTIDO A FUNCIÓN FLECHA PARA RESOLVER ERRORES DE CONTEXTO (this.)
  private handleExplosionItem = (exp: Phaser.GameObjects.GameObject, itemSprite: Phaser.GameObjects.GameObject) => {
    const item = itemSprite.getData('item') as Item;
    if (item) {
      item.explode();
    }
  }

  // CONVERTIDO A FUNCIÓN FLECHA PARA RESOLVER ERRORES DE CONTEXTO (this.)
  private handlePlayerDeath = (player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) => {
    if (this.isPlayerDead) return;

    const eSprite = enemy as Phaser.Physics.Arcade.Sprite;
    const enemyObj = eSprite.getData('owner') as Enemy;
    if (enemyObj && enemyObj.isDead()) return;

    this.lives--;
    this.deaths++;
    this.isPlayerDead = true;
    this.physics.pause();
    (player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000);

    if (this.lives > 0) {
      this.time.delayedCall(1500, () => {
        this.isPlayerDead = false;
        this.physics.resume();
        this.player.clearTint();
        this.player.setPosition((1 * 32) + 16, (1 * 32) + 16);
        this.player.alpha = 0.5;
        this.tweens.add({
          targets: this.player,
          alpha: 1,
          duration: 200,
          repeat: 5,
          onComplete: () => { this.player.alpha = 1; }
        });
      });
    } else {
      this.add.text(400, 300, "GAME OVER", { fontSize: '60px', color: '#ff0000', stroke: '#fff', strokeThickness: 4 }).setOrigin(0.5);
      this.reportSessionEnd(false); // REPORTE DE FIN DE JUEGO (DERROTA)
      this.time.delayedCall(3000, () => window.location.reload());
    }
  }

  // CONVERTIDO A FUNCIÓN FLECHA PARA RESOLVER ERRORES DE CONTEXTO (this.)
  private handlePickupItem = (player: Phaser.GameObjects.GameObject, itemSprite: Phaser.GameObjects.GameObject) => {
    const item = itemSprite.getData('item') as Item;
    if (item) {
      this.sound.play('sfx_powerup');
      this.currentSessionXP += XP_VALUES.ITEM_COLLECTED;
      this.trackAction('ITEM_COLLECTED');

      if (item.getType() === 'range') {
        if (this.bombRange < 6) this.bombRange++;
      }
      if (item.getType() === 'speed') {
        this.playerSpeed = Math.min(this.playerSpeed + 20, 300);
      }
      if (item.getType() === 'bomb') {
        if (this.maxBombs < 6) this.maxBombs++;
      }

      this.score += 50;
      item.destroy();
    }
  }

  // CONVERTIDO A FUNCIÓN FLECHA PARA RESOLVER ERRORES DE CONTEXTO (this.)
  private handleLevelComplete = (player: Phaser.GameObjects.GameObject, portal: Phaser.GameObjects.GameObject) => {
    if (this.isLevelComplete) return;
    if (!this.portalSpawned) return;

    this.isLevelComplete = true;
    this.physics.pause();
    this.sound.stopAll();

    this.score += 500;
    this.currentSessionXP += XP_VALUES.LEVEL_CLEARED;
    this.add.text(400, 300, "¡NIVEL COMPLETADO!", { fontSize: '40px', color: '#FFD700', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);

    this.trackAction('LEVEL_CLEARED');
    this.reportSessionEnd(true); // REPORTE DE FIN DE JUEGO (VICTORIA)

    this.time.delayedCall(2000, () => {
      this.scene.restart({
        level: this.currentLevel + 1,
        score: this.score,
        lives: this.lives,
        bombs: this.maxBombs,
        speed: this.playerSpeed,
        range: this.bombRange,
        difficulty: 'normal'
      });
    });
  }

  private handlePlayerMovement() {
    if (!this.player.body) return;
    this.player.setVelocity(0);

    const isMoving = this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown;
    if (isMoving && Date.now() - this.lastMovementReport > 100) {
      this.trackAction('MOVEMENT_INPUT');
      this.lastMovementReport = Date.now();
    }

    if (this.cursors.left.isDown) { this.player.setVelocityX(-this.playerSpeed); this.player.anims.play('left', true); }
    else if (this.cursors.right.isDown) { this.player.setVelocityX(this.playerSpeed); this.player.anims.play('right', true); }
    else if (this.cursors.up.isDown) { this.player.setVelocityY(-this.playerSpeed); this.player.anims.play('up', true); }
    else if (this.cursors.down.isDown) { this.player.setVelocityY(this.playerSpeed); this.player.anims.play('down', true); }
    else { this.player.anims.play('turn'); this.player.anims.stop(); }
  }

  private handleBombInput() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.currentBombs >= this.maxBombs) return;
      const gridX = Math.round((this.player.x - 16) / 32);
      const gridY = Math.round((this.player.y - 16) / 32);
      const x = (gridX * 32) + 16;
      const y = (gridY * 32) + 16;

      const existingBombs = this.bombs.getChildren();
      const overlap = existingBombs.some((b: any) => Phaser.Math.Distance.Between(b.x, b.y, x, y) < 10);
      if (overlap) return;

      const bomb = this.physics.add.sprite(x, y, 'bomb');
      bomb.setImmovable(true);
      bomb.body.moves = false;
      this.bombs.add(bomb);
      this.currentBombs++;
      this.sound.play('sfx_bomb');

      this.trackAction('BOMB_PLACED', { gridX, gridY });

      this.time.delayedCall(3000, () => { if (bomb.active) this.explodeBomb(bomb, bomb.x, bomb.y); });
    }
  }

  private explodeBomb(bomb: Phaser.GameObjects.GameObject, x: number, y: number) {
    (bomb as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
    bomb.destroy();

    this.currentBombs--;
    this.sound.play('sfx_explode');
    this.createExplosionSprite(x, y);

    const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    let chainHitCount = 0;

    dirs.forEach(dir => {
      for (let i = 1; i <= this.bombRange; i++) {
        const tx = x + (dir.x * i * 32);
        const ty = y + (dir.y * i * 32);
        const tileX = Math.floor(tx / 32);
        const tileY = Math.floor(ty / 32);

        if (this.wallsLayer?.hasTileAt(tileX, tileY)) break;

        const hitTile = this.bricksLayer?.getTileAt(tileX, tileY);

        if (hitTile && hitTile.index === BRICK_TILE_ID) {
          this.createExplosionSprite(tx, ty);
          this.handleExplosionTile(hitTile);
          chainHitCount++;
          break;
        }

        this.createExplosionSprite(tx, ty);
      }
    });

    for (let i = 0; i < chainHitCount; i++) {
      this.currentSessionXP += XP_VALUES.CHAIN_HIT_BONUS;
      this.trackAction('CHAIN_HIT_BONUS');
    }
  }

  private createExplosionSprite(x: number, y: number) {
    const ex = this.add.rectangle(x, y, 32, 32, 0xffa500, 1);
    this.physics.add.existing(ex);
    this.explosionGroup.add(ex);
    this.tweens.add({ targets: ex, alpha: 0, duration: 500, onComplete: () => ex.destroy() });
  }

  private spawnPortalRandomly() {
    this.portalSpawned = true;
    let valid = false;
    let x = 0, y = 0, tries = 200;

    while (!valid && tries < 200) {
      tries++;
      const gx = Phaser.Math.Between(1, this.MAP_WIDTH - 2);
      const gy = Phaser.Math.Between(1, this.MAP_HEIGHT - 2);

      if (!this.wallsLayer?.hasTileAt(gx, gy) && (!this.bricksLayer || !this.bricksLayer.hasTileAt(gx, gy))) {
        x = (gx * 32) + 16;
        y = (gy * 32) + 16;

        if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) > 64) {
          valid = true;
        }
      }
    }
    if (!valid) { x = (this.MAP_WIDTH - 2) * 32 + 16; y = (this.MAP_HEIGHT - 2) * 32 + 16; }

    this.portal.spawn(x, y);
    const txt = this.add.text(400, 300, "¡PORTAL ABIERTO!", { fontSize: '30px', color: '#00ff00', stroke: '#000', strokeThickness: 4, fontFamily: 'monospace' }).setOrigin(0.5);
    this.time.delayedCall(2000, () => txt.destroy());
  }

  private spawnItem(x: number, y: number) {
    const itemTypes: ItemType[] = ['range', 'speed', 'bomb'];
    const randomType = itemTypes[Phaser.Math.Between(0, itemTypes.length - 1)];
    const item = new Item(this, x, y, randomType);
    this.itemsGroup.add(item.getSprite());
  }

  private createAnimations() {
    if (!this.anims.exists('down')) {
      this.anims.create({ key: 'down', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'up', frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'turn', frames: [{ key: 'player', frame: 0 }], frameRate: 20 });
    }
    if (!this.anims.exists('enemy_down')) {
      this.anims.create({ key: 'enemy_down', frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'enemy_right', frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'enemy_up', frames: this.anims.generateFrameNumbers('enemy', { start: 8, end: 11 }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'enemy_left', frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }), frameRate: 6, repeat: -1 });
    }
  }

  private spawnEnemies(count: number) {
    let spawned = 0; let tries = 0;
    while (spawned < count && tries < 100) {
      tries++;
      const x = Phaser.Math.Between(1, this.MAP_WIDTH - 2);
      const y = Phaser.Math.Between(1, this.MAP_HEIGHT - 2);
      if (x < 5 && y < 5) continue;
      if (!this.wallsLayer?.hasTileAt(x, y) && (!this.bricksLayer || !this.bricksLayer.hasTileAt(x, y))) {
        const enemy = new Enemy(this, (x * 32) + 16, (y * 32) + 16);
        this.enemiesList.push(enemy);
        this.enemiesGroup.add(enemy.getSprite());
        spawned++;
      }
    }
  }

  private generateDestructibles(tileset: Phaser.Tilemaps.Tileset): Phaser.Tilemaps.TilemapLayer {
    const bricksLayer = this.map.createBlankLayer('Bricks', tileset, 0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);

    for (let y = 0; y < this.MAP_HEIGHT; y++) {
      for (let x = 0; x < this.MAP_WIDTH; x++) {
        if ((x === 1 && y === 1) || (x === 1 && y === 2) || (x === 2 && y === 1)) continue;

        if (!this.wallsLayer?.hasTileAt(x, y) && Math.random() < 0.3) {
          bricksLayer.putTileAt(BRICK_TILE_ID, x, y);
        }
      }
    }
    return bricksLayer;
  }
}