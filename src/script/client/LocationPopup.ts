import {Popup} from "./Popup";
import {Location} from "../common/Game/CharacterState";
import {SVGGenerator} from "./SVGGenerator";
import {crel} from "./Utilities";




export class LocationPopup<T> extends Popup<T> {
    private resizeListener: EventListenerOrEventListenerObject;

    constructor(location: Location) {
        let svg;

        const card = crel.div({
            'class': 'card-container'
        },
            SVGGenerator.locationCard(location)
        );

        super(card);
        this.resizeImage();

        this.resizeListener = () => {
            this.resizeImage();
        };
        window.addEventListener('resize', this.resizeListener);
    }

    private resizeImage() {
        const cardAspectRatio = 196/269;
        let height = window.innerHeight * 0.8;
        let width = height * cardAspectRatio;
        const otherWidth = window.innerWidth * 0.8;
        if(otherWidth < width) {
            width = otherWidth;
            height = width / cardAspectRatio;
        }
        const svg: SVGImageElement = this.content.querySelector('.card-image');
        svg.style.width = width + 'px';
        svg.style.height = height + 'px';
    }

    cleanup() {
        window.removeEventListener('resize', this.resizeListener);
    }
}
