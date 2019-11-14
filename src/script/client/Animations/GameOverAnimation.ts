import {Animation} from "../AnimationQueue";
import {UIManager} from "../UIManager";
import {FullRoom} from "../../common/Protocol/RoomInterface";


export class GameOverAnimation implements Animation {
    manager: UIManager;
    data: FullRoom;

    constructor(data: FullRoom, manager: UIManager) {
        this.data = data;
        this.manager = manager;
    }

    async execute() {
        this.manager.log('Partie terminée');
        this.data.board.states.forEach(c => this.manager.game.addCharacterData(c));
        this.data.winners.forEach(id => {
            const player = this.manager.game.players.find(p => p.character.id === id);
            this.manager.log('{0:player} a gagné', player);
        });
    }
}
