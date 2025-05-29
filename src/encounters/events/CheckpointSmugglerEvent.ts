import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { SirenDaguerreotype } from "../../relics/cursedcargo/cards/SirenDaguerreotype";
import { WatchfulClown } from "../../relics/cursedcargo/cards/WatchfulClown";

class AcceptSafeContrabandChoice extends AbstractChoice {
    constructor() {
        super(
            "Accept the Safe Contraband",
            "Gain the Siren Daguerreotype. Seems harmless enough."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The satchel weighed almost nothing, which should have been my first warning. But Pemberton's promise of \"proper infernal coinage\" was too tempting to ignore. Besides, how much trouble could unauthorized paperwork cause?\n\n" +
            "\"Right then,\" I said, taking the satchel. \"Where's this Dutch contact of yours?\"\n\n" +
            "Pemberton's relief was palpable. \"Splendid! De Vries keeps a counting house near the Dis Foundry. Can't miss it - only building with tulips growing outside. Well, hell-tulips. They scream a bit, but he's sentimental.\"\n\n" +
            "I stowed the satchel in the crawler's hidden compartment - every Company vehicle had one, though we weren't supposed to know about them. Pemberton melted back into the swamp with a jaunty salute.\n\n" +
            "The checkpoint inspection was tense. The Ferrymen went through our cargo with their usual methodical hostility, tapping panels and consulting their endless lists. One inspector lingered near the hidden compartment, and I nearly shot him before he moved on.\n\n" +
            "But we passed through, package intact. Inside was a photograph labelled 'Siren Daguerreotype'—unsettling, but seemingly harmless. The weight of it seems to grow with each mile toward the Second Circle. Morrison keeps giving me looks - he knows I've taken on something dubious.\n\n" +
            "Still, if this De Vries pays half what Pemberton promised, it'll be worth a little risk. Probably.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const card = new SirenDaguerreotype();
        this.actionManager().addCardToMasterDeck(card);
        this.actionManager().displaySubtitle(`Received ${card.name}`, 2000);
    }
}

class AcceptDangerousContrabandChoice extends AbstractChoice {
    constructor() {
        super(
            "Accept the Dangerous Contraband",
            "Gain the Watchful Clown. Fortune favors the bold, allegedly."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "When a man like Pemberton calls something \"inflammatory,\" a wise man walks away. But the promise of \"commensurate rewards\" spoke to my greed, and I've always been three parts avarice to one part sense.\n\n" +
            "\"What exactly am I smuggling?\" I asked.\n\n" +
            "Pemberton produced a lead-lined box that radiated cold despite the ambient heat. \"Best you don't know the specifics. Let's just say certain parties in the Second Circle have developed a taste for... unusual munitions. Theological ordnance, you might say.\"\n\n" +
            "Theological ordnance. In Hell. What could possibly go wrong?\n\n" +
            "I took the box, noting how Pemberton held it like it might explode. Which, given the circumstances, it very well might. He gave me the same directions to De Vries, adding, \"He'll pay in soul-contracts. Proper ones, not the Ferryman's debased currency.\"\n\n" +
            "The checkpoint was a nightmare. The box seemed to grow heavier as we approached, and I swear it whispered. The Ferrymen's inspection took twice as long as usual, their instruments going wild whenever they came near our general vicinity. I kept up a steady patter about Company business and manifest irregularities, Morrison backing my lies with admirable creativity.\n\n" +
            "We scraped through by sheer luck - a fight broke out between two other travelers, drawing the inspectors away at the crucial moment. But I could feel their eyes on us as we chugged away.\n\n" +
            "Whatever's in this box, it's already causing trouble. Thompson swears he can hear it singing hymns. Morrison won't go near it. Inside is something called the 'Watchful Clown.' I'm beginning to think that whatever De Vries is paying, it won't be enough.\n\n" +
            "But we're committed now. God help us.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const card = new WatchfulClown();
        this.actionManager().addCardToMasterDeck(card);
        this.actionManager().displaySubtitle(`Received ${card.name}`, 2000);
    }
}

class TurnInSmugglerChoice extends AbstractChoice {
    constructor() {
        super(
            "Turn In the Smuggler",
            "Agree to his terms, then seize him for the bounty (gain 50 Hell Currency)."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "I smiled warmly at Pemberton, already calculating the bounty. The Ferrymen paid well for smugglers - in writs and permits that could smooth our way through Hell. And here was one, gift-wrapped and desperate.\n\n" +
            "\"Capital idea, Pemberton!\" I said, reaching for the satchel. \"Always happy to help a fellow Englishman. Morrison, Jenkins - help Mr. Pemberton with his packages, would you?\"\n\n" +
            "The relief on his face lasted exactly as long as it took my men to grab his arms.\n\n" +
            "\"What the devil—Cavendish, you treacherous—\"\n\n" +
            "\"Terribly sorry, old boy,\" I said, stepping back. \"But the Ferrymen pay better than your Dutchman ever could.\"\n\n" +
            "Pemberton went berserk. That wicked knife of his came out faster than thought, and he twisted like an eel, slashing at whoever was closest. Thompson caught it in the shoulder - a nasty gash that sent him reeling into the mud with a cry.\n\n" +
            "But Morrison and Jenkins are old hands at subduing violent men. They bore Pemberton down, Morrison's knee in his back while Jenkins secured the knife. Pemberton spat curses that would have made a drill sergeant blush.\n\n" +
            "I fired my pistol into the air - the agreed signal for the checkpoint. The Ferrymen arrived with suspicious speed - I suspect they'd been watching the whole time.\n\n" +
            "\"Smuggler,\" I announced cheerfully, presenting Pemberton like a Christmas goose. \"Attempting to corrupt honest Company men with contraband.\"\n\n" +
            "The lead inspector, a dour creature with a hexagonal brass sigil where his face should be, examined Pemberton with professional interest. The sigil pulsed a dull green as he spoke, though how he managed it without a mouth was beyond me. \"The bounty has been approved. You will receive appropriate writs and dispensations.\"\n\n" +
            "He handed over a stack of documents - heavy vellum that thrummed with bureaucratic power. I didn't examine them closely, but the weight and feel promised future conveniences. In Hell, I'd learned, the right paperwork was better than armor.\n\n" +
            "As they dragged Pemberton away, he caught my eye. \"This isn't over, Cavendish,\" he snarled. \"I've got friends in low places.\"\n\n" +
            "I'm sure he does. But for now, Thompson's wound is bandaged, we've got valuable writs, and Pemberton's learning the cardinal rule of smuggling: never trust anyone, especially not Harry Cavendish. All in all, a profitable morning's work.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const reward = 50;
        this.actionManager().modifySovereignInfernalNotes(reward);
        this.actionManager().displaySubtitle(`Received ${reward} Hell Currency`, 2000);
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Decline Everything",
            "Refuse politely and leave. No good comes from smuggling in Hell."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "I looked at Pemberton - desperate, dangerous, and definitely trouble - and felt a rare moment of clarity. Whatever he was offering, the price would be higher than advertised. It always is.\n\n" +
            "\"Sorry, Pemberton,\" I said, already backing the crawler away. \"Strict Company policy against unauthorized cargo. You understand.\"\n\n" +
            "His face twisted with disappointment and rage. \"Policy? Since when has any Company man cared about policy down here?\"\n\n" +
            "Since the alternative involved smuggling unknown contraband past inspectors who could audit souls, but I didn't say that. Instead, I had Morrison train his rifle on the man while we reversed course.\n\n" +
            "\"Coward!\" Pemberton shouted after us. \"You'll regret this! De Vries pays in coins you can't imagine!\"";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {}
}

export class CheckpointSmugglerEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Checkpoint Smuggler";
        this.portraitName = "placeholder_event_background_1";
        this.description = "We were making good time in the Company's steam-crawler - a monstrous amphibious contraption that wheezed and clanked through the marsh like a tubercular iron toad - when a figure emerged from behind a cluster of dead mangroves. British, by his bearing, though gone thoroughly native. Torn regimental jacket, boots held together with marsh grass, and the calculating eyes of a man who'd sell his grandmother for passage money.\n\n" +
            "[color=white]\"That's a Company crawler, isn't it?\"[/color] He had that public school drawl that tries too hard to sound casual. [color=white]\"Pemberton's the name - late of the 33rd Foot, now engaged in... private enterprise.\"[/color]\n\n" +
            "Morrison reached for his rifle, but I waved him down. In my experience, fellow scoundrels rarely attack without provocation - professional courtesy and all that.\n\n" +
            "Pemberton glanced nervously toward the checkpoint visible through the mist ahead. [color=white]\"Look here, I'll cut to the chase. Those Ferryman bastards have gotten dreadfully particular about cargo inspections lately. Some nonsense about 'maintaining the integrity of infernal commerce.' I've got a shipment that needs to reach my associate in the Second Circle - Dutch fellow, entirely reliable.\"[/color]\n\n" +
            "He produced a leather satchel, keeping it carefully closed. [color=white]\"Nothing dramatic, you understand. Just a little curiosity called the Siren Daguerreotype. My contact will make it worth your while - he's good for it, trades in proper infernal coinage.\"[/color]\n\n" +
            "Then his eyes took on that fevered gleam I knew too well from opium dens and cavalry messes. [color=white]\"Of course, if you're feeling adventurous, I've got another package. Rather more valuable, rather more... inflammatory, shall we say. It's known as the Watchful Clown. The rewards would be commensurate with the risk.\"[/color]\n\n" +
            "He leaned closer, and I caught the scent of brimstone and desperation. [color=white]\"So what'll it be? Help a fellow Englishman make an honest dishonest living?\"[/color]\n\n" +
            "His hand rested casually near a wicked-looking knife at his belt - not a threat exactly, just a reminder that desperate men do desperate things. The checkpoint loomed ahead, where I could already see the Ferrymen's inspectors preparing their ledgers and measuring poles.";
        this.choices = [
            new AcceptSafeContrabandChoice(),
            new AcceptDangerousContrabandChoice(),
            new TurnInSmugglerChoice(),
            new DeclineChoice()
        ];
    }
}

