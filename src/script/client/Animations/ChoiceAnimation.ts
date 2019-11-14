import {Animation} from "../AnimationQueue";
import {UIManager} from "../UIManager";
import {ChoiceInterface} from "../../common/Protocol/ChoiceInterface";


export class ChoiceAnimation implements Animation {
    ui: UIManager;
    choice: ChoiceInterface;

    constructor(choice: ChoiceInterface, ui: UIManager) {
        this.ui = ui;
        this.choice = choice;
    }

    async execute() {
        this.ui.choose(this.choice);
    }
}
