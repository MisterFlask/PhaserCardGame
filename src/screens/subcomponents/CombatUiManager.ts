// src/subcomponents/CombatUIManager.ts

import Phaser from 'phaser';
import { CombatRules } from '../../rules/CombatRules';
import LayoutUtils from '../../ui/LayoutUtils';
import Menu from '../../ui/Menu';
import { TextBox } from '../../ui/TextBox';

interface MenuOption {
    text: string;
    callback: () => void;
}

class CombatUIManager {
    private scene: Phaser.Scene;
    public menu!: Menu;
    public combatStatusText!: TextBox;
    public endTurnButton!: TextBox;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createMenu();
        this.createCombatStatusText();
        this.createEndTurnButton();
    }

    private createMenu(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        const menuOptions: MenuOption[] = [
            {
                text: 'Start New Game',
                callback: () => this.scene.scene.restart()
            },
            {
                text: 'New Campaign',
                callback: () => this.scene.scene.start('Campaign')
            },
            {
                text: 'Quit',
                callback: () => this.scene.game.destroy(true)
            }
        ];

        const menuHeight = menuOptions.length * 60 + 100;

        this.menu = new Menu({
            scene: this.scene,
            x: gameWidth - 250,
            y: gameHeight / 2,
            width: 300,
            height: menuHeight,
            options: menuOptions
        });

        const menuButton = this.scene.add.text(gameWidth - 350, 50, '☰ Menu', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 },
            align: 'center',
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.menu.toggle())
            .on('pointerover', () => {
                this.scene.tweens.add({
                    targets: menuButton,
                    scale: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
                menuButton.setStyle({ backgroundColor: '#555555' });
            })
            .on('pointerout', () => {
                this.scene.tweens.add({
                    targets: menuButton,
                    scale: 1.0,
                    duration: 200,
                    ease: 'Power2'
                });
                menuButton.setStyle({ backgroundColor: '#000000' });
            })
            .setName('MenuButton');

        this.scene.add.existing(menuButton);
    }

    private createCombatStatusText(): void {
        const gameWidth = this.scene.scale.width;
        const pileY = LayoutUtils.getPileY(this.scene);

        this.combatStatusText = new TextBox({
            scene: this.scene,
            x: gameWidth * 0.5,
            y: pileY,
            width: 300,
            height: 50,
            text: 'CURRENT COMBAT STATUS',
            style: { fontSize: '24px', color: '#000', align: 'center' }
        });
    }

    private createEndTurnButton(): void {
        const gameWidth = this.scene.scale.width;
        const pileY = LayoutUtils.getPileY(this.scene);

        this.endTurnButton = new TextBox({
            scene: this.scene,
            x: gameWidth * 0.7,
            y: pileY,
            width: 120,
            height: 40,
            text: 'End Turn',
            style: {
                fontSize: '24px',
                color: '#ffffff'
            },
            backgroundImage: 'button_background'
        });

        this.endTurnButton.background!!.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                CombatRules.endTurn();
            });

        this.scene.add.existing(this.endTurnButton.background!!);
        this.scene.add.existing(this.endTurnButton.text);
    }

    public updateLayout(width: number, height: number): void {
        // Update positions based on new width and height
        this.menu.updatePosition(width - 250, height / 2);
        this.combatStatusText.setPosition(width * 0.5, LayoutUtils.getPileY(this.scene));
        this.endTurnButton.setPosition(width * 0.7, LayoutUtils.getPileY(this.scene));

        const menuButton = this.scene.children.getByName('MenuButton') as Phaser.GameObjects.Text;
        if (menuButton) {
            menuButton.setPosition(width - 350, 50);
        }
    }
}

export default CombatUIManager;
