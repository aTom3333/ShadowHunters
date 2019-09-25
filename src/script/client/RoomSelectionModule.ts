import {UIManager, UIModule} from "./UIManager";


export class RoomSelectionModule implements UIModule {
    manager: UIManager;
    rootElem: HTMLElement;
    listeners: any;

    constructor(manager: UIManager) {
        this.manager = manager;
        this.rootElem = document.querySelector('.room-selection');
        this.listeners = {};
    }

    initialize(): void {
        this.rootElem.style.display = 'initial';

        this.initializeNameForm();

        /*** Room List ***/
    }

    private initializeNameForm() {
        const form = this.rootElem.querySelector('form.name-form');

        const showNameInput = (name: string) => {
            const input: HTMLInputElement = form.querySelector('input.name-input');
            const display: HTMLSpanElement = form.querySelector('span.name-display');
            const changeButton: HTMLAnchorElement = form.querySelector('a.change-name');

            input.value = name;
            input.style.display = 'initial';
            display.style.display = 'none';
            changeButton.style.display = 'none';

            changeButton.removeEventListener('click', this.listeners.changeNameButton);

            form.addEventListener('submit', this.listeners.nameFormSubmit);
        };
        const showNameDisplay = (name: string) => {
            const input: HTMLInputElement = form.querySelector('input.name-input');
            const display: HTMLSpanElement = form.querySelector('span.name-display');
            const changeButton: HTMLAnchorElement = form.querySelector('a.change-name');

            display.innerText = name;
            input.style.display = 'none';
            display.style.display = 'initial';
            changeButton.style.display = 'initial';

            form.removeEventListener('submit', this.listeners.nameFormSubmit);

            changeButton.addEventListener('click', this.listeners.changeNameButton);
        };

        this.listeners.nameFormSubmit = (event: Event) => {
            event.preventDefault();

            const input: HTMLInputElement = form.querySelector('input.name-input');
            const name = input.value; // TODO Store name

            showNameDisplay(name);
        };
        this.listeners.changeNameButton = (event: Event) => {
            event.preventDefault();

            const name = '';// TODO Retrieve name

            showNameInput(name);
        };

        form.addEventListener('submit', this.listeners.nameFormSubmit);
    }

    deinitialize(): void {
        this.rootElem.style.display = 'none';

        this.deinitializeNameForm();
    }

    private deinitializeNameForm() {
        const form = this.rootElem.querySelector('form.name-form');
        const changeButton: HTMLAnchorElement = form.querySelector('a.change-name');
        form.removeEventListener('submit', this.listeners.nameFormSubmit);
        changeButton.removeEventListener('click', this.listeners.changeNameButton);
    }
}
