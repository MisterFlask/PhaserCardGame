import Phaser from 'phaser';
import { PhysicalIntent } from '../ui/PhysicalIntent';

export class IntentEmitter extends Phaser.Events.EventEmitter {
    private static instance: IntentEmitter;

    private constructor() {
        super();
    }

    public static getInstance(): IntentEmitter {
        if (!IntentEmitter.instance) {
            IntentEmitter.instance = new IntentEmitter();
        }
        return IntentEmitter.instance;
    }

    public emitIntentHover(intent: PhysicalIntent): void {
        this.emit('intenthover', intent);
    }

    public emitIntentHoverEnd(intent: PhysicalIntent): void {
        this.emit('intenthoverend', intent);
    }

    // Add these lines if not present
    public emitIntentHoverOver(intent: PhysicalIntent): void {
        this.emit('intenthoverover', intent);
    }

    public emitIntentHoverOut(intent: PhysicalIntent): void {
        this.emit('intenthoverout', intent);
    }
}