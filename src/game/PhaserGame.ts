import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { PlayerSessionData } from '../core/progression/XPSystemTypes';

const baseConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 608,
  backgroundColor: '#000000',

  pixelArt: true,
  roundPixels: true,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scene: [GameScene],

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const startGame = (
  parentContainerId: string,
  difficulty: string,
  authData: { addSessionXP: (data: PlayerSessionData) => Promise<number> }
) => {
  const finalConfig: Phaser.Types.Core.GameConfig = {
    ...baseConfig,
    parent: parentContainerId,
  };

  const game = new Phaser.Game(finalConfig);

  // Pasar datos a la escena: dificultad + función de XP
  game.scene.start('GameScene', { difficulty, ...authData });

  return game;
}

export default startGame;