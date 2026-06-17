import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { WinScene } from './scenes/WinScene';
new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 700,
    backgroundColor: '#1a0a00',
    scene: [MenuScene, GameScene, WinScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
});
