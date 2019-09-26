import {RoomSelectionModule} from "./RoomSelectionModule";
import {Data} from "./Data";
import {Popup} from "./Popup";


export enum UIState {
    RoomSelection, BeforeGame, InGame
}

export interface UIModule {
    manager: UIManager;

    initialize(): void;
    deinitialize(): void;
}

export class UIManager {
    state: UIState;
    module: UIModule;
    data: Data;
    private currentPopup: Popup<any>;

    constructor(data: Data) {
        this.data = data;
        // TODO Test state
        this.switchTo(UIState.RoomSelection);
    }

    switchTo(state: UIState) {
        if(this.module)
            this.module.deinitialize();
        switch (state) {
            case UIState.RoomSelection:
                this.module = new RoomSelectionModule(this);
                break;
        }
        this.module.initialize();
        this.state = state;
    }

    popup<T>(popup: Popup<T>): Promise<T> {
        if(this.currentPopup)
            this.currentPopup.forceClose();

        const promise =  new Promise<T>((resolve, reject) => {
            const popupBg: HTMLElement = document.querySelector('.popup-bg');
            const holder = popupBg.querySelector('.popup-holder');

            const closePopupFn = (result) => {
                popupBg.style.display = 'none';
                holder.innerHTML = '';
                popupBg.removeEventListener('click', closeWithDefault);
                resolve(result);
            };
            const closeWithDefault = (event: Event) => {
                closePopupFn(popup.cancelValue);
            };

            popupBg.addEventListener('click', closeWithDefault);

            holder.appendChild(popup.content);
            popupBg.style.display = 'flex';

            popup.launch(closePopupFn);
        });

        this.currentPopup = popup;

        return promise;
    }
}
