import {Animation} from "../AnimationQueue";
import {UIManager} from "../UIManager";
import {PlayerInterface} from "../../common/Protocol/PlayerInterface";


export class AttackAnimation implements Animation {
    info: { attacker: PlayerInterface, target: PlayerInterface, type: string };
    manager: UIManager;

    constructor(info: { attacker: PlayerInterface, target: PlayerInterface, type: string }, manager: UIManager) {
        this.info = info;
        this.manager = manager;
    }

    async execute() {
        this.manager.log('{0:player} {2} {1:player}', this.info.attacker, this.info.target, this.getTextForType(this.info.type));
    }

    private getTextForType(type: string) {
        switch(type) {
            case 'attack':
                return 'attaque';
            case 'hauntedforest':
                return 'utilise les pouvoirs de la Forêt hantée sur';
            case 'thunder':
                return 'fait abattre la foudre sur';
        }
    }
}
