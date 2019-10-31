import {Logger} from "./Logger";
import {InGameModule} from "./InGameModule";
import {PlayerDisplay} from "./PlayerDisplay";
import {Location} from "../common/Game/CharacterState";
import {crel} from "./Utilities";
import {getCssColor} from "./PawnArea";


export class PrettyLogger extends Logger {
    module: InGameModule;
    entryTemplate: HTMLTemplateElement;
    root: HTMLElement;

    constructor(module: InGameModule) {
        super((elems: Array<string|Element>) => {
            const entry = document.importNode(this.entryTemplate.content, true);
            entry.querySelector('.log-entry').append(...elems);
            const heightBefore = this.root.scrollHeight;
            this.root.append(entry);
            const heightDiff = this.root.scrollHeight - heightBefore;
            this.root.scrollBy(0, heightDiff);
        });
        this.module = module;
        this.root = document.querySelector('.log');
        this.entryTemplate = this.root.querySelector('.log-entry-template');

        this.transformers.player = (player: PlayerDisplay) => {
            const playerDisplay = this.module.playerDisplays.find(pd => pd.name === player.name);
            const span = crel.span({
                style: {
                    color: getCssColor(playerDisplay.character.pawnColor),
                    'font-weight': 'bold'
                }
            }, player.name);
            span.addEventListener('mouseenter', () => {
                playerDisplay.startHover();
            });
            span.addEventListener('mouseleave', () => {
                playerDisplay.endHover();
            });
            return span;
        };
        this.transformers.location = (location: Location) => {
            return location.name;
        };
    }

    cleanup() {
        this.root.innerHTML = '';
    }
}
