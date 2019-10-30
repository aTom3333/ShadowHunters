import {Animation} from "../AnimationQueue";
import {UIManager} from "../UIManager";
import {PlayerInterface} from "../../common/Protocol/PlayerInterface";
import {InGameModule} from "../InGameModule";
import {sleep} from "../Utilities";
import {AddDices, DiceResult} from "../../common/Event/DiceResult";


abstract class DiceAnimationBase implements Animation {
    manager: UIManager;
    dice: DiceResult;

    constructor(dice: DiceResult, manager: UIManager) {
        this.dice = dice;
        this.manager = manager;
    }

    async execute() {
        this.manager.log('{0} fait un lancé de dés');

        await sleep(1000); // TODO Super animation

        this.manager.log('{0} a fait {1}');
        console.log(this.dice.player.name, this.diceValue());
    }

    abstract diceValue(): number
}

export class DiceAnimationAdd extends DiceAnimationBase {

    constructor(dice: AddDices, manager: UIManager) {
        super(dice, manager);
    }

    diceValue() {
        const dice = this.dice as AddDices;
        return dice.d4.value + dice.d6.value;
    }
}
