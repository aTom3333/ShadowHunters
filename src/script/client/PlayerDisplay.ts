import {Pawn} from "./PawnArea";
import {InGameModule} from "./InGameModule";
import {CharacterState, Location} from "../common/Game/CharacterState";


export class PlayerDisplay {
    healthPawn: Pawn;
    locationPawn: Pawn;
    module: InGameModule;
    character: CharacterState;
    name: string;
    root: HTMLElement;

    constructor(name: string, character: CharacterState, module: InGameModule, root: HTMLElement) {
        this.name = name;
        this.character = character;
        this.module = module;
        this.root = root;
        this.healthPawn = new Pawn(this.character.pawnColor);
        this.locationPawn = new Pawn(this.character.pawnColor);

        this.updateLocation();
    }

    updateLocation() {
        if(this.character.location && !this.character.dead) {
            // Put at location
            const locIdx = this.module.manager.game.board.locations.findIndex(l => l.name === this.character.location.name);
            if (locIdx !== -1) {
                this.locationPawn.moveTo(InGameModule.locationPawnAreas[locIdx]);
                this.locationPawn.show(this.root);
            }
        } else {
            // Put in middle
            this.locationPawn.moveTo(InGameModule.middleArea);
            this.locationPawn.show(this.root);
        }
    }

    cleanup() {
        this.locationPawn.hide();
        this.healthPawn.hide();
    }

    //changeHP()
}
