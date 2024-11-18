import { Scene } from 'phaser';
import { CardLibrary } from '../gamecharacters/playerclasses/cards/CardLibrary';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from '../rules/GameState';
import { ActionManager } from '../utils/ActionManager';
import { DepthManager } from './DepthManager';
import Menu from './Menu';
import { TextBox } from './TextBox';

interface DebugMenuOption {
    text: string;
    callback: () => void;
}

export class DebugMenu {
    private scene: Scene;
    private menu!: Menu;
    private currentPage: 'main' | 'cards' | 'relics' = 'main';
    private itemsPerPage = 8;
    private currentCardPage = 0;
    private currentRelicPage = 0;
    private pageDisplay!: TextBox;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createMenu();
        this.hide();

        // Add keyboard listener for 'Z' key
        const zKey = this.scene.input.keyboard?.addKey('Z');
        zKey?.on('down', () => {
            this.toggle();
        });
    }

    private createMenu(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        this.menu = new Menu({
            scene: this.scene,
            x: gameWidth / 2,
            y: gameHeight / 2,
            width: 400,
            height: 500,
            options: this.getMainMenuOptions()
        });

        this.menu.container.setDepth(DepthManager.getInstance().OVERLAY_BASE + 1000);

        // Create page display
        this.pageDisplay = new TextBox({
            scene: this.scene,
            x: gameWidth / 2,
            y: gameHeight / 2 - 230,
            width: 200,
            height: 40,
            text: '',
            style: {
                fontSize: '18px',
                color: '#ffffff'
            },
            fillColor: 0x000000,
            textBoxName: 'DebugMenuPageDisplay'
        });
        this.pageDisplay.setDepth(DepthManager.getInstance().OVERLAY_BASE + 1001);
        this.pageDisplay.setVisible(false);
    }

    private getMainMenuOptions(): DebugMenuOption[] {
        return [
            {
                text: 'Add Cards',
                callback: () => this.showCardsMenu()
            },
            {
                text: 'Add Relics',
                callback: () => this.showRelicsMenu()
            },
            {
                text: 'Add Resources (+4 each)',
                callback: () => {
                    const combatResources = GameState.getInstance().combatState.combatResources;
                    combatResources.modifyPluck(4);
                    combatResources.modifyPages(4);
                    combatResources.modifyIron(4);
                    combatResources.modifyVenture(4);
                    combatResources.modifySmog(4);
                    combatResources.modifyPowder(4);
                }
            },
            {
                text: 'Close',
                callback: () => this.hide()
            }
        ];
    }

    private showCardsMenu(): void {
        this.currentPage = 'cards';
        this.updateCardMenuPage();
    }

    private showRelicsMenu(): void {
        this.currentPage = 'relics';
        this.updateRelicMenuPage();
    }

    private updateCardMenuPage(): void {
        const allCards = CardLibrary.getInstance().getAllCards();
        const totalPages = Math.ceil(allCards.length / this.itemsPerPage);
        const startIdx = this.currentCardPage * this.itemsPerPage;
        const endIdx = Math.min(startIdx + this.itemsPerPage, allCards.length);

        const options: DebugMenuOption[] = allCards
            .slice(startIdx, endIdx)
            .map(card => ({
                text: card.name,
                callback: () => {
                    const newCard = new (card.constructor as any)();
                    ActionManager.getInstance().createCardToHand(newCard);
                }
            }));

        // Add navigation options
        options.push(
            {
                text: '← Previous Page',
                callback: () => {
                    this.currentCardPage = (this.currentCardPage - 1 + totalPages) % totalPages;
                    this.updateCardMenuPage();
                }
            },
            {
                text: 'Next Page →',
                callback: () => {
                    this.currentCardPage = (this.currentCardPage + 1) % totalPages;
                    this.updateCardMenuPage();
                }
            },
            {
                text: 'Back to Main',
                callback: () => {
                    this.currentPage = 'main';
                    this.menu.updateOptions(this.getMainMenuOptions());
                    this.pageDisplay.setVisible(false);
                }
            }
        );

        this.menu.updateOptions(options);
        this.pageDisplay.setText(`Page ${this.currentCardPage + 1}/${totalPages}`);
        this.pageDisplay.setVisible(true);
    }

    private updateRelicMenuPage(): void {
        const allRelics = RelicsLibrary.getInstance().getAllRelics();
        const totalPages = Math.ceil(allRelics.length / this.itemsPerPage);
        const startIdx = this.currentRelicPage * this.itemsPerPage;
        const endIdx = Math.min(startIdx + this.itemsPerPage, allRelics.length);

        const options: DebugMenuOption[] = allRelics
            .slice(startIdx, endIdx)
            .map(relic => ({
                text: relic.name,
                callback: () => {
                    const newRelic = new (relic.constructor as any)();
                    ActionManager.getInstance().addRelicToInventory(newRelic);
                }
            }));

        // Add navigation options
        options.push(
            {
                text: '← Previous Page',
                callback: () => {
                    this.currentRelicPage = (this.currentRelicPage - 1 + totalPages) % totalPages;
                    this.updateRelicMenuPage();
                }
            },
            {
                text: 'Next Page →',
                callback: () => {
                    this.currentRelicPage = (this.currentRelicPage + 1) % totalPages;
                    this.updateRelicMenuPage();
                }
            },
            {
                text: 'Back to Main',
                callback: () => {
                    this.currentPage = 'main';
                    this.menu.updateOptions(this.getMainMenuOptions());
                    this.pageDisplay.setVisible(false);
                }
            }
        );

        this.menu.updateOptions(options);
        this.pageDisplay.setText(`Page ${this.currentRelicPage + 1}/${totalPages}`);
        this.pageDisplay.setVisible(true);
    }

    public show(): void {
        this.menu.show();
    }

    public hide(): void {
        this.menu.hide();
        this.pageDisplay.setVisible(false);
    }

    public toggle(): void {
        if (this.menu.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }

    public destroy(): void {
        this.menu.destroy();
        this.pageDisplay.destroy();
    }
} 