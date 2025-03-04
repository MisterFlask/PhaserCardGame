import { Scene } from 'phaser';
import { CardLibrary } from '../gamecharacters/playerclasses/cards/CardLibrary';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from '../rules/GameState';
import { ActionManager } from '../utils/ActionManager';
import { CardOwnershipManager } from "../utils/CardOwnershipManager";
import GameImageLoader from '../utils/ImageUtils';
import { DepthManager } from './DepthManager';
import Menu from './Menu';
import { TextBox } from './TextBox';

interface DebugMenuOption {
    text: string;
    callback: () => void;
}

type PageType = 'main' | 'cards' | 'relics' | 'backgrounds' | 'combat';

export class DebugMenu {
    private scene: Scene;
    private menu: Menu;
    private pageDisplay: TextBox;

    private currentPage: PageType = 'main';
    private itemsPerPage = 8;
    private currentCardPage = 0;
    private currentRelicPage = 0;
    private currentBackgroundPage = 0;

    private allCards = CardLibrary.getInstance().getAllCards();
    private allRelics = RelicsLibrary.getInstance().getAllBeneficialRelics();
    private allBackgrounds: string[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
        this.preloadData();
        this.menu = this.createMenu();
        this.pageDisplay = this.createPageDisplay();
        this.hide();
        this.addKeyboardListener();
    }

    private preloadData(): void {
        // sort data once
        this.allRelics.sort((a, b) => a.getDisplayName().localeCompare(b.getDisplayName()));

        const categories = ['location_backgrounds'] as const;
        categories.forEach(cat => {
            const data = GameImageLoader.images[cat].files;
            data.forEach(file => this.allBackgrounds.push(file.replace(/\.(png|svg)$/, '')));
        });
    }

    private addKeyboardListener(): void {
        const zKey = this.scene.input.keyboard?.addKey('Z');
        zKey?.on('down', () => this.toggle());
    }

    private createMenu(): Menu {
        const { width, height } = this.scene.scale;
        return new Menu({
            scene: this.scene,
            x: width / 2,
            y: height / 2,
            width: 400,
            height: 500,
            options: this.getMainMenuOptions()
        });
    }

    private createPageDisplay(): TextBox {
        const { width, height } = this.scene.scale;
        const pageDisplay = new TextBox({
            scene: this.scene,
            x: width / 2,
            y: height / 2 - 230,
            width: 200,
            height: 40,
            text: '',
            style: { fontSize: '18px', color: '#ffffff' },
            fillColor: 0x000000,
            textBoxName: 'DebugMenuPageDisplay'
        });

        pageDisplay.setDepth(DepthManager.getInstance().OVERLAY_BASE + 1001);
        pageDisplay.setVisible(false);

        this.menu.container.setDepth(DepthManager.getInstance().OVERLAY_BASE + 1000);
        return pageDisplay;
    }

    private getMainMenuOptions(): DebugMenuOption[] {
        return [
            { text: 'Add Cards', callback: () => this.goToPage('cards') },
            { text: 'Add Relics', callback: () => this.goToPage('relics') },
            { text: 'Change Background', callback: () => this.goToPage('backgrounds') },
            { text: 'Combat Options', callback: () => this.goToPage('combat') },
            {
                text: 'Add Resources (+4 each)',
                callback: () => {
                    const cState = GameState.getInstance().combatState.combatResources;
                    cState.modifyAshes(4);
                    cState.modifyMettle(4);
                    cState.modifyVenture(4);
                    cState.modifySmog(4);
                    cState.modifyBlood(4);
                    cState.modifyPluck(4);
                }
            },
            {
                text: 'Add Surface Currency (+1000)',
                callback: () => {
                    GameState.getInstance().moneyInVault += 1000;
                }
            },
            {
                text: 'Add Hell Currency (+1000)',
                callback: () => {
                    GameState.getInstance().denarians += 1000;
                }
            },
            { text: 'Close', callback: () => this.hide() }
        ];
    }

    private getCombatOptions(): DebugMenuOption[] {
        return [
            {
                text: 'Kill All Enemies',
                callback: () => {
                    const gameState = GameState.getInstance();
                    const actionManager = ActionManager.getInstance();
                    gameState.combatState.enemies.forEach(enemy => {
                        actionManager.dealDamage({
                            baseDamageAmount: 9999,
                            target: enemy,
                            ignoresBlock: true
                        });
                    });
                }
            },
            { text: 'Back to Main', callback: () => this.backToMain() }
        ];
    }

    private goToPage(page: PageType): void {
        this.currentPage = page;
        switch (page) {
            case 'cards':
                this.updatePaginatedMenu(
                    this.allCards.map(c => ({ name: c.name, onClick: () => this.addCard(c) })),
                    this.currentCardPage,
                    i => (this.currentCardPage = i),
                    () => this.backToMain()
                );
                break;
            case 'relics':
                this.updatePaginatedMenu(
                    this.allRelics.map(r => ({ name: r.getDisplayName(), onClick: () => this.addRelic(r) })),
                    this.currentRelicPage,
                    i => (this.currentRelicPage = i),
                    () => this.backToMain()
                );
                break;
            case 'backgrounds':
                this.updatePaginatedMenu(
                    this.allBackgrounds.map(b => ({ name: b, onClick: () => this.changeBackground(b) })),
                    this.currentBackgroundPage,
                    i => (this.currentBackgroundPage = i),
                    () => this.backToMain()
                );
                break;
            case 'combat':
                this.menu.updateOptions(this.getCombatOptions());
                this.pageDisplay.setVisible(false);
                break;
            default:
                this.menu.updateOptions(this.getMainMenuOptions());
                this.pageDisplay.setVisible(false);
        }
    }

    private addCard(card: any): void {
        const newCard = card.Copy();
        CardOwnershipManager.getInstance().assignOwnerToCard(newCard);
        ActionManager.getInstance().createCardToHand(newCard);
    }

    private addRelic(relic: any): void {
        const newRelic = new (relic.constructor as any)();
        newRelic.init();
        ActionManager.getInstance().addRelicToInventory(newRelic);
    }

    private changeBackground(bg: string): void {
        this.scene.events.emit('changeBackground', bg);
    }

    private backToMain(): void {
        this.currentPage = 'main';
        this.menu.updateOptions(this.getMainMenuOptions());
        this.pageDisplay.setVisible(false);
    }

    private updatePaginatedMenu(
        items: { name: string; onClick: () => void }[],
        currentPage: number,
        setPage: (val: number) => void,
        onBack: () => void
    ): void {
        const totalPages = Math.max(1, Math.ceil(items.length / this.itemsPerPage));
        const pageIndex = Math.min(currentPage, totalPages - 1);
        setPage(pageIndex);

        const startIdx = pageIndex * this.itemsPerPage;
        const endIdx = Math.min(startIdx + this.itemsPerPage, items.length);

        const pageItems = items.slice(startIdx, endIdx).map(i => ({
            text: i.name,
            callback: i.onClick
        }));

        pageItems.push(
            {
                text: '← Previous Page',
                callback: () => {
                    const prevPage = (pageIndex - 1 + totalPages) % totalPages;
                    setPage(prevPage);
                    this.updatePaginatedMenu(items, prevPage, setPage, onBack);
                }
            },
            {
                text: 'Next Page →',
                callback: () => {
                    const nextPage = (pageIndex + 1) % totalPages;
                    setPage(nextPage);
                    this.updatePaginatedMenu(items, nextPage, setPage, onBack);
                }
            },
            { text: 'Back to Main', callback: () => onBack() }
        );

        this.menu.updateOptions(pageItems);
        this.pageDisplay.setText(`Page ${pageIndex + 1}/${totalPages}`);
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
        if (this.menu.isVisible()) this.hide(); else this.show();
    }

    public destroy(): void {
        this.menu.destroy();
        this.pageDisplay.destroy();
    }
}
