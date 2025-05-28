// Event: Marsh Brigands demanding toll
import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Encounter } from "../EncounterManager";
import { Brigand } from "../monsters/act1_segment1/act1_segment0/Brigand";
import { ActionManagerFetcher } from "../../utils/ActionManagerFetcher";
import { AbstractConsumable } from "../../consumables/AbstractConsumable";

class FightThroughChoice extends AbstractChoice {
    constructor() {
        super(
            "Fight Through",
            "Order the attack. You've faced worse odds. Probably."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Pride and parsimony won out - damned if I'd pay tolls to brigands, and I wasn't wasting valuable writs on scum like this. Besides, we had a steam-crawler and they had... bits of windmill.\n\n" +
            "\"Morrison,\" I said quietly, \"full speed ahead on my signal. Everyone else, prepare to repel boarders.\"\n\n" +
            "The brigand leader saw it in my face. His grin turned feral. \"The hard way then? Your funeral, Company dog!\"\n\n" +
            "I checked my pistol one last time - cheap Company ammunition, but it would have to do. The brigands were already spreading out, taking positions behind their makeshift fortifications. Whatever German nastiness lurked beneath the water would have to be dealt with as it came.\n\n" +
            "\"On my mark,\" I told the men, trying to project more confidence than I felt. The crawler's engine growled beneath us like a hungry beast.\n\n" +
            "The brigand leader raised his rifle. \"Last chance, Company man!\"\n\n" +
            "\"Now!\" I roared.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const encounter = new Encounter([new Brigand(), new Brigand(), new Brigand()], this.gameState().currentAct, 0);
        this.actionManager().cleanupAndRestartCombat({ encounter, shouldStartWithMapOverlay: false });
    }
}

class PresentDocumentationChoice extends AbstractChoice {
    private consumable: AbstractConsumable | null;
    constructor() {
        const gameState = ActionManagerFetcher.getGameState();
        const consumable = gameState.consumables[0] ?? null;
        const desc = consumable
            ? `Hand over ${consumable.getDisplayName()}.`
            : "You have no documents to present.";
        super(
            "Present Documentation",
            desc
        );
        this.consumable = consumable;
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The writs from the Pemberton affair seemed to burn in my coat pocket. In Hell, I'd learned, the right papers could be more valuable than gold - a currency unto themselves.\n\n" +
            "\"I have documentation,\" I announced, producing the vellum sheets with what I hoped looked like confidence. \"Writs of passage. Yours if you let us through.\"\n\n" +
            "The brigand leader's entire demeanor changed. The rifle lowered slightly, and his scarred face showed genuine interest. \"Writs, eh? Let's see them then. And no tricks, or we'll paint the marsh with you.\"\n\n" +
            "He waded closer, still cautious. I held out the documents, noting how his crude copper sigil - triangular, nothing like the ferrymen's elaborate marks - pulsed as he examined them.\n\n" +
            "\"Tollkeeper's Division stamps,\" he muttered, clearly impressed. \"These are proper official. Must've cost you dear to get these.\" He looked up sharply. \"Or cost someone else dear, eh?\"\n\n" +
            "I kept my face neutral. \"Do we have a deal?\"\n\n" +
            "He weighed the writs in his hand like a merchant testing gold. Behind him, his men shifted restlessly, but their leader was already calculating future profits.\n\n" +
            "\"These'll do nicely,\" he decided. \"See boys? Sometimes the paperwork's worth more than coin. We can trade these on, maybe even set up something more... permanent.\"\n\n" +
            "The thought of these brigands going \"legitimate\" with stolen writs was somehow more disturbing than their current banditry. But they began dismantling their barricade with practiced efficiency.\n\n" +
            "\"Pleasure doing business,\" the leader said, carefully folding the writs into his coat. \"Company types always have the best documentation.\"\n\n" +
            "As we chugged through the gap, Morrison murmured, \"Those writs might've been useful later, sir.\"\n\n" +
            "Perhaps. But they were useful now, getting us past armed brigands without bloodshed or lightening our coffers. In Hell, timing was everything.";
    }

    canChoose(): boolean {
        return this.consumable !== null;
    }

    effect(): void {
        const gameState = ActionManagerFetcher.getGameState();
        if (this.consumable) {
            const idx = gameState.consumables.indexOf(this.consumable);
            if (idx !== -1) {
                gameState.consumables.splice(idx, 1);
            }
        }
    }
}

class PayTollChoice extends AbstractChoice {
    private toll: number;
    constructor() {
        const gameState = ActionManagerFetcher.getGameState();
        const heads = gameState.currentRunCharacters.length;
        const price = 50 * heads;
        super(
            "Pay the Toll",
            `Hand over ${price} Hell Currency to pass.`
        );
        this.toll = price;
        this.mechanicalInformationText = `Lose ${this.toll} Hell Currency.`;
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The mention of a per-head toll made my teeth ache. With our full complement, it would be a painful sum - a significant portion of our remaining operational funds. But I looked at the German chemical slick waiting beneath the water, the brigands' eager faces, and the valuable writs in my pocket, and made the only sensible choice.\n\n" +
            "\"We'll pay,\" I said, trying not to let the words choke me.\n\n" +
            "The brigand leader's grin widened. \"Smart man! See boys, Company types ain't all stupid.\"\n\n" +
            "Morrison looked at me like I'd grown a second head. In all our years of service, he'd never seen Harry Cavendish willingly part with money. But he dutifully opened our strongbox and began counting out the demanded toll.\n\n" +
            "The brigands made a show of counting it, biting several coins to test them. \"Proper Company obols,\" the leader approved. \"Not like that debased coinage the Dutch are pushing. You're free to pass.\"\n\n" +
            "They dismantled a section of barricade with practiced efficiency. As we chugged through, the leader called out, \"Pleasure doing business! We're here every Tuesday through Saturday. Sundays we raid the dam works!\"";
    }

    canChoose(): boolean {
        return this.gameState().sovereignInfernalNotes >= this.toll;
    }

    effect(): void {
        this.actionManager().modifySovereignInfernalNotes(-this.toll);
    }
}

export class MarshBrigandsTollEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Marsh Toll Ambush";
        this.portraitName = "placeholder_event_background_1";
        this.description = "The crawler ground to a halt with a mechanical wheeze that suggested even it knew we were in trouble. Across the narrow channel, some enterprising souls had constructed a barricade from the detritus of failed colonial ventures - I spotted pieces of Dutch windmill, British telegraph poles, and what might have been a German artillery piece, all lashed together with ferry rope.\n\n" +
            "\"Bugger,\" Morrison observed, accurately.\n\n" +
            "A dozen figures emerged from concealment, armed with a museum's worth of stolen weapons. Their leader, a scarred brute wearing the remains of three different uniforms, raised what looked disturbingly like a Company-issue rifle.\n\n" +
            "\"That's far enough, Company dogs!\" His accent was pure London docks, though Hell had added disturbing harmonics. \"This here's a toll crossing now. You want through, you pay.\"\n\n" +
            "I counted at least fifteen more brigands in the marsh grass. Some were clearly ex-military - deserters from every European power's failed expeditions. Others had that gaunt, desperate look of civilian contractors who'd taken the wrong job. All of them had the dead-eyed stare of men with nothing left to lose.\n\n" +
            "\"Three options,\" the leader continued, apparently enjoying his moment. \"You can try to ram through - wouldn't recommend it, we've mined the water with something the Germans left behind. You can pay the toll - fifty obols per head, nice and simple. Or...\"\n\n" +
            "He grinned, revealing teeth filed to points - a disturbing fashion among the marsh brigands, I'd heard.\n\n" +
            "\"Or if you've got proper documentation, we'll honor it. Even we outcasts respect the paperwork. Hell runs on it, don't it?\"\n\n" +
            "Thompson whispered urgently about our ammunition count. Jenkins was already calculating firing angles. But I was weighing our options. The obols would hurt - that was nearly half our remaining funds. Fighting would be bloody, and who knew what German surprises lurked beneath the murky water. But those writs from Pemberton's betrayal were burning a hole in my pocket...\n\n" +
            "The brigand leader waited, patient as a crocodile. Behind him, his men fingered their weapons with anticipatory glee.\n\n" +
            "\"What's it gonna be, Company man?\"";
        this.choices = [
            new FightThroughChoice(),
            new PresentDocumentationChoice(),
            new PayTollChoice()
        ];
    }
}
