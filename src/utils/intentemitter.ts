import Phaser from 'phaser';
import { BaseCharacter } from '../gamecharacters/BaseCharacter';
import { PhysicalIntent } from '../ui/PhysicalIntent';

export class IntentEmitter extends Phaser.Events.EventEmitter {
    private static instance: IntentEmitter;

    public static readonly EVENT_INTENT_HOVER = 'intenthover';
    public static readonly EVENT_INTENT_HOVER_END = 'intenthoverend';
    public static readonly EVENT_INCOMING_INTENT_HOVER = 'incomingIntentHover';
    public static readonly EVENT_INCOMING_INTENT_HOVER_END = 'incomingIntentHoverEnd';

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

    public emitIncomingIntentHover(owner: BaseCharacter): void {
        this.emit(IntentEmitter.EVENT_INCOMING_INTENT_HOVER, owner);
    }

    public emitIncomingIntentHoverEnd(owner: BaseCharacter): void {
        this.emit(IntentEmitter.EVENT_INCOMING_INTENT_HOVER_END, owner);
    }
}