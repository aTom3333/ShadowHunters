import {Popup} from "./Popup";
import {Location} from "../common/Game/CharacterState";
import {SVGGenerator} from "./SVGGenerator";
import {crel} from "./Utilities";
import {CardPopup} from "./CardPopup";


export class LocationPopup<T> extends CardPopup<T> {

    constructor(location: Location) {
        super(SVGGenerator.locationCard(location));
    }
}
