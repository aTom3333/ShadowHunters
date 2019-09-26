import {RoomSelectionModule} from "./RoomSelectionModule";
import {Data} from "./Data";
import {Popup} from "./Popup";
import {SetupGameModule} from "./SetupGameModule";
import {joinRoom} from "./JoinRoom";
import {RoomState} from "../common/Protocol/RoomInterface";
import {GameManager} from "./GameManager";


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
    game: GameManager;
    currentRoomName: string;

    constructor(data: Data) {
        this.data = data;
        this.game = null;
        this.currentPopup = null;
        this.currentRoomName = '';

        if(data.hasName() && data.hasRoomName()) {
            joinRoom(this, { name: data.roomName, state: RoomState.Setup, noplayers: 0});
        } else {
            this.switchTo(UIState.RoomSelection);
        }

        window.addEventListener('hashchange', (event: Event) => {
            event.preventDefault();
            if(data.hasName() && data.hasRoomName()) {
                joinRoom(this, { name: data.roomName, state: RoomState.Setup, noplayers: 0});
            } else {
                this.switchTo(UIState.RoomSelection);
            }
        });
    }

    switchTo(state: UIState) {
        if(state === UIState.RoomSelection && this.state === UIState.RoomSelection)
            return;
        console.log('swith to '+state.toString());
        if(this.currentPopup)
            this.currentPopup.forceClose();
        if(this.module)
            this.module.deinitialize();
        switch (state) {
            case UIState.RoomSelection:
                this.currentRoomName = '';
                this.module = new RoomSelectionModule(this);
                break;
            case UIState.BeforeGame:
                this.module = new SetupGameModule(this);
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
                holder.removeEventListener('click', stopPropagation);
                this.currentPopup = null;
                resolve(result);
            };
            const closeWithDefault = (event: Event) => {
                closePopupFn(popup.cancelValue);
            };
            const stopPropagation = (event: Event) => {
                event.stopPropagation();
                event.preventDefault();
            };

            popupBg.addEventListener('click', closeWithDefault);
            holder.addEventListener('click', stopPropagation);

            holder.appendChild(popup.content);
            popupBg.style.display = 'flex';

            popup.launch(closePopupFn);
        });

        this.currentPopup = popup;

        return promise;
    }
}
