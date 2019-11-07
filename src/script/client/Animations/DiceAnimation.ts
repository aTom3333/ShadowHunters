import {Animation} from "../AnimationQueue";
import {UIManager} from "../UIManager";
import {PlayerInterface} from "../../common/Protocol/PlayerInterface";
import {InGameModule} from "../InGameModule";
import {sleep} from "../Utilities";
import {AddDices, Dice4, Dice6, DiceResult, SubtractDices} from "../../common/Event/DiceResult";


abstract class DiceAnimationBase implements Animation {
    manager: UIManager;
    dice: DiceResult;

    constructor(dice: DiceResult, manager: UIManager) {
        this.dice = dice;
        this.manager = manager;
    }

    async execute() {
        //this.manager.log('{0:player} fait un lancé de dés', this.dice.player);

        await sleep(1000); // TODO Super animation

        this.manager.log(`{0:player} lance des dés : {1} (${this.diceString()})`, this.dice.player, this.diceValue());
    }

    abstract diceValue(): number
    abstract diceString(): string
}

export class DiceAnimationAdd extends DiceAnimationBase {

    constructor(dice: AddDices, manager: UIManager) {
        super(dice, manager);
    }

    diceValue() {
        const dice = this.dice as AddDices;
        return dice.d4.value + dice.d6.value;
    }

    diceString() {
        return 'd4+d6';
    }
}

export class DiceAnimationSub extends DiceAnimationBase {

    constructor(dice: SubtractDices, manager: UIManager) {
        super(dice, manager);
    }

    diceValue() {
        const dice = this.dice as SubtractDices;
        return Math.abs(dice.d4.value - dice.d6.value);
    }

    diceString() {
        return 'd6-d4';
    }
}

export class DiceAnimation4 extends DiceAnimationBase {

    constructor(dice: Dice4, manager: UIManager) {
        super(dice, manager);
    }

    diceValue() {
        const dice = this.dice as Dice4;
        return dice.value;
    }

    diceString() {
        return 'd4';
    }
}

export class DiceAnimation6 extends DiceAnimationBase {

    constructor(dice: Dice6, manager: UIManager) {
        super(dice, manager);
    }

    diceValue() {
        const dice = this.dice as Dice6;
        return dice.value;
    }

    diceString() {
        return 'd6';
    }
}
