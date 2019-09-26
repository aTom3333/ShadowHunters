import {UIManager, UIModule} from "./UIManager";


export class SetupGameModule implements UIModule {
    manager: UIManager;
    rootElem: HTMLElement;
    listeners: {[key: string]: EventListenerOrEventListenerObject};

    constructor(manager: UIManager) {
        this.manager = manager;
        this.rootElem = document.querySelector('.setup');
        this.listeners = {};
    }

    initialize(): void {
        // Do stuff
        this.rootElem.querySelector('.name-display').textContent = this.manager.data.name;

        this.rootElem.style.display = 'initial';
    }

    deinitialize(): void {
        this.rootElem.style.display = 'none';

        // Do stuff
    }
}
