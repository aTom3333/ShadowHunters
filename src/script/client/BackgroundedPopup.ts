import {Popup} from "./Popup";


export class BackgroundedPopup<T> extends Popup<T> {
    constructor(content: HTMLElement, cancelValue: T = null) {
        const elemWithBg = document.createElement('div');
        elemWithBg.classList.add('popup-content-bg');
        elemWithBg.append(content);

        super(elemWithBg, cancelValue);
    }
}
