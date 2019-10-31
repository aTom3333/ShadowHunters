import {RoomSelectionModule} from "./RoomSelectionModule";
import {Data} from "./Data";
import {Popup} from "./Popup";
import {SetupGameModule} from "./SetupGameModule";
import {joinRoom} from "./JoinRoom";
import {RoomState} from "../common/Protocol/RoomInterface";
import {GameManager, Player} from "./GameManager";
import {InGameModule} from "./InGameModule";
import {ConsoleLogger, Logger} from "./Logger";


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
    logger: Logger;

    constructor(data: Data) {
        this.data = data;
        this.game = null;
        this.currentPopup = null;
        this.currentRoomName = '';
        this.logger = new ConsoleLogger();

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
        if(this.currentPopup)
            this.currentPopup.forceClose();
        if(this.module)
            this.module.deinitialize();
        switch (state) {
            case UIState.RoomSelection:
                this.currentRoomName = '';
                if(this.game) {
                    this.game.destroy();
                    this.game = null;
                }
                this.module = new RoomSelectionModule(this);
                break;
            case UIState.BeforeGame:
                this.module = new SetupGameModule(this);
                break;
            case UIState.InGame:
                this.module = new InGameModule(this);
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
                this.currentPopup.cleanup();
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

    alert(alert: any) {
        // TODO Implement
    }

    error(error: any) {
        console.error(error);
        console.trace();
        // TODO Implement
    }

    log(format: string, ...args: Array<any>) {
        this.logger.log(format, ...args);
        if(this.state === UIState.InGame)
            (this.module as InGameModule).logger.log(format, ...args);
    }

    queue(work: any) { // TODO Correct type
        if(this.state === UIState.InGame) {
            (this.module as InGameModule).animQueue.add(work);
        }
    }

    updatePlayerList(players: Array<Player>) {
        if(this.state === UIState.BeforeGame)
            (this.module as SetupGameModule).updatePlayerList(players);
    }
}
