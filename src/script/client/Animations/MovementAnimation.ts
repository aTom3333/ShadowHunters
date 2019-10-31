import {Animation} from "../AnimationQueue";
import {UIManager} from "../UIManager";
import {PlayerInterface} from "../../common/Protocol/PlayerInterface";
import {InGameModule} from "../InGameModule";
import {sleep} from "../Utilities";


export class MovementAnimation implements Animation {
    manager: UIManager;
    player: PlayerInterface;

    constructor(player: PlayerInterface, manager: UIManager) {
        this.player = player;
        this.manager = manager;
    }

    async execute() {
        this.manager.log('{0:player} se déplace à {1:location}', this.player, this.player.character.location);
        const character = this.manager.game.board.states.find(s => s.id === this.player.character.id);
        const location = this.manager.game.board.locations.find(l => l.name === this.player.character.location.name);
        character.location = location;
        const playerDisplay = (this.manager.module as InGameModule).playerDisplays.find(pd => pd.character.id === this.player.character.id);
        playerDisplay.updateLocation();

        await sleep(1000);
    }
}
