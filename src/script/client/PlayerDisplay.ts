import {Pawn} from "./PawnArea";
import {InGameModule} from "./InGameModule";
import {CharacterState, Location} from "../common/Game/CharacterState";


export class PlayerDisplay {
    healthPawn: Pawn;
    locationPawn: Pawn;
    module: InGameModule;
    character: CharacterState;
    name: string;
    pawnRoot: HTMLElement;
    listeners: {[key: string]: EventListenerOrEventListenerObject};

    constructor(name: string, character: CharacterState, module: InGameModule, pawnRoot: HTMLElement) {
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
            }
        };

        this.updateLocation();
        this.updateHP();
    }

    updateLocation() {
        if(this.character.location && !this.character.dead) {
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
        if(this.character.dead) {
            // Put in middle
            this.healthPawn.moveTo(InGameModule.middleArea);
            this.showPawn(this.healthPawn);
        } else {
            this.healthPawn.moveTo(InGameModule.healthPawnAreas[Math.min(this.character.lostHp, 14)]);
            this.showPawn(this.healthPawn);
        }
    }

    private showPawn(pawn: Pawn) {
        if(pawn.show(this.pawnRoot)) {
            pawn.visual.addEventListener('mouseenter', this.listeners.startHover);
            pawn.visual.addEventListener('mouseleave', this.listeners.endHover);
        }
    }

    private hidePawn(pawn: Pawn) {
        if(pawn.visual) {
            pawn.visual.removeEventListener('mouseenter', this.listeners.startHover);
            pawn.visual.removeEventListener('mouseleave', this.listeners.endHover);
        }
        pawn.hide();
    }

    cleanup() {
        this.hidePawn(this.locationPawn);
        this.hidePawn(this.healthPawn);
    }

    startHover() {
        this.healthPawn.startHover();
        this.locationPawn.startHover();
    }

    endHover() {
        this.healthPawn.endHover();
        this.locationPawn.endHover();
    }
}
