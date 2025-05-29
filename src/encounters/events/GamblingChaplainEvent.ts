import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { TraumaLibrary } from "../../gamecharacters/statuses/curses/traumas/TraumaLibrary";
import { EcclesiasticalRecommendation } from "../../relics/special/EcclesiasticalRecommendation";

class SubtleCheatChoice extends AbstractChoice {
    private goldReward = 50;
    constructor() {
        super(
            "Employ Subtle Techniques",
            "Use marked cards and card counting. Gain 50 Hell Currency."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Years of regimental card games had taught me the value of subtle advantage. While Mortwright shuffled, I palmed several cards from the spare deck, noting their markings with practiced ease. The other players were clearly amateurs—Guild clerks and junior officers who'd never learned proper technique.\n\n" +
            "The game proceeded smoothly, with careful manipulation ensuring favorable hands without obvious pattern. I lost occasionally to maintain appearances, won consistently enough to show profit, and maintained the cheerful bonhomie expected at a chaplain's table. Professional card-sharping, really—the sort of skill every colonial officer acquires during long postings.\n\n" +
            "[color=white]\"Remarkable luck tonight, Brigadier,\"[/color] Mortwright observed with what might have been knowing amusement. [color=white]\"The Lord certainly smiles upon military men of... particular... talents.\"[/color]";
    }

    canChoose(): boolean { return true; }

    effect(): void {
        this.actionManager().modifySovereignInfernalNotes(this.goldReward);
        this.actionManager().displaySubtitle(`Gained ${this.goldReward} Hell Currency`, 2000);
    }
}

class BrazenCheatChoice extends AbstractChoice {
    private goldReward = 100;
    constructor() {
        super(
            "Cheat Outrageously",
            "Stack the deck openly for 100 Hell Currency. Gain a random curse."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "When opportunity presents itself wearing clerical clothing, a bold officer seizes it completely. I approached the game with the sort of brazen dishonesty that built the Empire—marked cards, stacked deck, palmed aces, and absolutely no pretense of subtlety.\n\n" +
            "The other players' shock was evident as I won hand after hand with impossible consistency. One Guild functionary actually accused me of cheating, at which point I calmly showed him my marked cards and asked if he'd prefer to take the matter up with my military authority or settle it as gentlemen.\n\n" +
            "Mortwright's cheerful demeanor evaporated as I cleaned out his collection plate along with everyone else's stakes. His face went quite purple, and the symbols on his collar began pulsing with distinctly unchristian light.\n\n" +
            "[color=white]\"You absolute bounder! In a house of worship! Before the very altar!\"[/color] His voice rose to a pitch that made the stained glass windows vibrate ominously. [color=white]\"May your cards turn to ash in your hands! May every wager bring you misfortune! May bureaucrats question every document you present!\"[/color]\n\n" +
            "The chaplain's rage was quite spectacular—years of repressed military frustration combined with righteous clerical indignation. As his blessing turned to curse, I felt a distinct chill settle over my person, though I maintained appropriate military bearing throughout his tantrum. Still, gold is gold, and an angry chaplain's curse is merely the cost of doing business in Hell's moral economy.";
    }

    canChoose(): boolean { return true; }

    effect(): void {
        const curse = TraumaLibrary.getRandomTrauma();
        this.actionManager().addCardToMasterDeck(curse);
        this.actionManager().displaySubtitle(`Received curse: ${curse.name}`, 2000);
        this.actionManager().modifySovereignInfernalNotes(this.goldReward);
        this.actionManager().displaySubtitle(`Gained ${this.goldReward} Hell Currency`, 2000);
    }
}

class AbstainChoice extends AbstractChoice {
    constructor() {
        super(
            "Abstain Entirely",
            "Politely decline. Receive a Bureaucratic writ."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Professional discretion suggested avoiding games conducted by chaplains in territories where standard theological principles might not apply. I declined politely, citing military regulations and personal principles regarding gambling in religious establishments.\n\n" +
            "Mortwright accepted my refusal with good grace, though obvious disappointment. [color=white]\"Quite understandable,\"[/color] he said cheerfully. [color=white]\"Military discipline serves as its own form of spiritual practice. Perhaps we might offer alternative spiritual guidance?\"[/color]\n\n" +
            "Instead of a prayer book, he produced an official-looking document bearing multiple seals and signatures in various supernatural inks. [color=white]\"A Letter of Ecclesiastical Recommendation,\"[/color] he explained with obvious pride. [color=white]\"Certifies your moral character for colonial administrative purposes. Quite useful when dealing with territorial authorities who value proper spiritual endorsement.\"[/color]\n\n" +
            "The writ bore impressive credentials—ecclesiastical approval, military character references, and what appeared to be certification of moral standing from multiple denominations, including several I was fairly certain didn't exist in conventional theology. Sometimes avoiding temptation proves more profitable than succumbing to it—particularly when abstinence comes with proper paperwork.";
    }

    canChoose(): boolean { return true; }

    effect(): void {
        const writ = new EcclesiasticalRecommendation();
        this.addLedgerItem(writ);
        this.actionManager().displaySubtitle(`Received ${writ.getDisplayName()}`, 2000);
    }
}

export class GamblingChaplainEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Gambling Chaplain";
        this.portraitName = "placeholder_event_background_2";
        this.description = "The chapel stood incongruously among the marsh reeds—proper Gothic stonework, stained glass windows, even a bell tower that might have graced any English parish. Only the gargoyles moved occasionally, and the bell tolled hours that didn't correspond to any earthly timepiece.\n\n" +
            "Inside, we found what appeared to be a perfectly respectable chaplain conducting evening service for a congregation of colonial soldiers, Guild functionaries, and various beings whose exact nature I preferred not to examine too closely. The good reverend wore proper Anglican vestments, though his collar bore symbols that definitely weren't regulation crosses.\n\n" +
            "[color=white]\"Ah, newcomers!\"[/color] he exclaimed with evident delight after concluding his sermon on the theological implications of non-Euclidean geometry. [color=white]\"Welcome to St. Belzebub's. I'm Chaplain Mortwright, formerly of the 42nd Foot. Marvelous to see fellow Christians maintaining proper observance in these trying circumstances.\"[/color]\n\n" +
            "The service had been... unconventional... but undeniably Anglican in structure. The hymns included verses I didn't recognize, and the communion wine had peculiar effects on the congregation's visibility, but the fundamental liturgical framework remained familiar.\n\n" +
            "[color=white]\"Now then,\"[/color] Mortwright continued cheerfully, [color=white]\"we traditionally conclude evening service with a small game of chance. Nothing elaborate—just a friendly wager to support the chapel's charitable works. Care to try your luck?\"[/color]\n\n" +
            "He produced a deck of cards that seemed entirely normal, though they occasionally rearranged themselves when no one was looking directly at them. The other players looked to be a mix of Guild functionaries and colonial soldiers—exactly the sort of marks any sensible officer would fleece given proper opportunity. As Mortwright explained the rules, I noticed several promising details: marked cards, a fellow player with an obvious tell, and what appeared to be a spare deck tucked beneath the chaplain's prayer book. The question wasn't whether to cheat, but how boldly to go about it.";
        this.choices = [
            new SubtleCheatChoice(),
            new BrazenCheatChoice(),
            new AbstainChoice()
        ];
    }
}
