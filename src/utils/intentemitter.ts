import Phaser from 'phaser';
import { PhysicalIntent } from '../ui/PhysicalIntent';

export class IntentEmitter extends Phaser.Events.EventEmitter {
    private static instance: IntentEmitter;

    public static readonly EVENT_INTENT_HOVER = 'intenthover';
    public static readonly EVENT_INTENT_HOVER_END = 'intenthoverend';

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
        this.emit(IntentEmitter.EVENT_INTENT_HOVER, intent);
    }

    public emitIntentHoverEnd(intent: PhysicalIntent): void {
        this.emit(IntentEmitter.EVENT_INTENT_HOVER_END, intent);
    }
}