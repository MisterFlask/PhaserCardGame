/**

abstract class BarkData {
    abstract getBarkText(): string;
    
    intervalInMilliseconds: number = 10000;
    eventName?: string;
    uniqueId: string;
    entity: AbstractCard;
    maxDistance: number = 100;
    barkDuration: number = 2000;
    timeEvent?: Phaser.Time.TimerEvent
}

export class BarkManager {
    private scene: Phaser.Scene;
    private activeBarks: Map<string, BarkData>;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.activeBarks = new Map();

        if (this.scene) {
            this.scene.events.on('bark-event', (eventName: string) => {
                this.onEventFired(eventName);
            });
        }
    }

    public addBark(
        getBarkText: () => string,
        interval: number,
        eventName: string,
        uniqueId: string,
        entity: Phaser.GameObjects.GameObject & { x: number; y: number },
        maxDistance = 100,
        barkDuration = 2000
    ): void {
        if (this.activeBarks.has(uniqueId)) return;

        const barkData: BarkData = {
            getBarkText,
            intervalInSeconds,
            eventName,
            uniqueId,
            entity,
            maxDistance,
            barkDuration,
            timeEvent: null
        };

        if (interval > 0) {
            barkData.timeEvent = this.scene.time.addEvent({
                delay: interval,
                loop: true,
                callback: () => {
                    this.triggerBark(barkData);
                }
            });
        }

        this.activeBarks.set(uniqueId, barkData);
    }

    public removeBark(uniqueId: string): void {
        const barkData = this.activeBarks.get(uniqueId);
        if (!barkData) return;

        if (barkData.timeEvent) {
            barkData.timeEvent.remove(false);
        }

        this.activeBarks.delete(uniqueId);
    }

    private onEventFired(eventName: string): void {
        for (const barkData of this.activeBarks.values()) {
            if (barkData.eventName === eventName && barkData.intervalInSeconds <= 0) {
                this.triggerBark(barkData);
            }
        }
    }

    private triggerBark(barkData: BarkData): void {
        if (!barkData.entity || typeof barkData.entity.x !== 'number' || typeof barkData.entity.y !== 'number') return;

        const baseX = barkData.entity.x;
        const baseY = barkData.entity.y;

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * barkData.maxDistance;
        const offsetX = Math.cos(angle) * dist;
        const offsetY = Math.sin(angle) * dist;

        const x = baseX + offsetX;
        const y = baseY + offsetY;

        const barkText = barkData.getBarkText();
        if (!barkText) return;

        const textObj = this.scene.add.text(x, y, barkText, {
            fontSize: '14px',
            color: '#fff',
            backgroundColor: '#000'
        });

        this.scene.time.delayedCall(barkData.barkDuration, () => {
            textObj.destroy();
        });
    }
}
 */