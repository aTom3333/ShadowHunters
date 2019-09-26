

export class Popup<T> {
    content: HTMLElement;
    closePopup: Function;
    cancelValue: T;


    constructor(content: HTMLElement, cancelValue: T = null) {
        this.content = content;
        this.cancelValue = cancelValue;
    }

    launch(close: Function) {
        this.closePopup = close;
    }

    forceClose() {
        this.closePopup(this.cancelValue);
    }
}
