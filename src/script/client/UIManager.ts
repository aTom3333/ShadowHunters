import {RoomSelectionModule} from "./RoomSelectionModule";


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

    constructor() {
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
}
