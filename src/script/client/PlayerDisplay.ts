import {getCssColor, Pawn} from "./PawnArea";
import {InGameModule} from "./InGameModule";
import {CharacterState, Location} from "../common/Game/CharacterState";
import {SVGGenerator} from "./SVGGenerator";
import {crel, instantiateTemplate} from "./Utilities";
import {CardPopup} from "./CardPopup";


export class PlayerDisplay {
    healthPawn: Pawn;
    locationPawn: Pawn;
    module: InGameModule;
    character: CharacterState;
    name: string;
    pawnRoot: HTMLElement;
    listeners: { [key: string]: EventListenerOrEventListenerObject };
    characterInfo: HTMLElement;

    constructor(name: string, character: CharacterState, module: InGameModule, pawnRoot: HTMLElement, playerListRoot: HTMLElement) {
        this.name = name;
        this.character = character;
        this.module = module;
        this.pawnRoot = pawnRoot;
        this.healthPawn = new Pawn(this.character.pawnColor);
        this.locationPawn = new Pawn(this.character.pawnColor);
        this.listeners = {
            startHover: () => {
                this.startHover();
            },
            endHover: () => {
                this.endHover();
            },
            showCharacter: () => {
                if(this.character.identity)
                this.module.manager.popup(new CardPopup(SVGGenerator.characterCard(this.character.identity)));
            }
        };
        const node = instantiateTemplate(playerListRoot.querySelector('.player-info-template'), {
            '.player-name': name
        });

        playerListRoot.append(node);
        this.characterInfo = playerListRoot.querySelector('.player-info:last-child');
        this.characterInfo.style.color = getCssColor(character.pawnColor);

        this.characterInfo.addEventListener('mouseenter', this.listeners.startHover);
        this.characterInfo.addEventListener('mouseleave', this.listeners.endHover);
        this.characterInfo.addEventListener('click', this.listeners.showCharacter);

        this.updateLocation();
        this.updateHP();
        this.updateCharacter();
    }

    updateLocation() {
        if (this.character.location && !this.character.dead) {
            // Put at location
            const locIdx = this.module.manager.game.board.locations.findIndex(l => l.name === this.character.location.name);
            if (locIdx !== -1) {
                this.locationPawn.moveTo(InGameModule.locationPawnAreas[locIdx]);
                this.showPawn(this.locationPawn);
            }
        } else {
            // Put in middle
            this.locationPawn.moveTo(InGameModule.middleArea);
            this.showPawn(this.locationPawn);
        }
    }

    updateHP() {
        if (this.character.dead) {
            // Put in middle
            this.healthPawn.moveTo(InGameModule.middleArea);
            this.showPawn(this.healthPawn);
        } else {
            this.healthPawn.moveTo(InGameModule.healthPawnAreas[Math.min(this.character.lostHp, 14)]);
            this.showPawn(this.healthPawn);
        }
    }

    updateCharacter() {
        const card = this.characterInfo.querySelector('.player-identity');
        card.innerHTML = '';
        card.append(SVGGenerator.characterCard(this.character.identity));
        if(this.character.identity)
            card.classList.add('known');
    }

    private showPawn(pawn: Pawn) {
        if (pawn.show(this.pawnRoot)) {
            pawn.visual.addEventListener('mouseenter', this.listeners.startHover);
            pawn.visual.addEventListener('mouseleave', this.listeners.endHover);
        }
    }

    private hidePawn(pawn: Pawn) {
        if (pawn.visual) {
            pawn.visual.removeEventListener('mouseenter', this.listeners.startHover);
            pawn.visual.removeEventListener('mouseleave', this.listeners.endHover);
        }
        pawn.hide();
    }

    cleanup() {
        this.hidePawn(this.locationPawn);
        this.hidePawn(this.healthPawn);
        this.characterInfo.removeEventListener('mouseenter', this.listeners.startHover);
        this.characterInfo.removeEventListener('mouseleave', this.listeners.endHover);
        this.characterInfo.removeEventListener('click', this.listeners.showCharacter);
        this.characterInfo.remove();
    }

    startHover() {
        this.healthPawn.startHover();
        this.locationPawn.startHover();
        this.characterInfo.classList.add('hover');
    }

    endHover() {
        this.healthPawn.endHover();
        this.locationPawn.endHover();
        this.characterInfo.classList.remove('hover');
    }

    setCurrent(isCurrent: boolean) {
        if(isCurrent) {
            this.characterInfo.classList.add('current');
        } else {
            this.characterInfo.classList.remove('current')
        }
    }

    setSelf(isSelf: boolean = true) {
        if(isSelf) {
            this.characterInfo.classList.add('self');
        } else {
            this.characterInfo.classList.remove('self')
        }
    }
}
