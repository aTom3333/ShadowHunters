import {UIManager, UIModule} from "./UIManager";
import RoomApi from "./RoomApi";
import {StatusType} from "../common/Protocol/JsonResponse";
import {instantiateTemplate} from "./Utilities";
import {RoomState} from "../common/Protocol/RoomInterface";
import {joinRoom} from "./JoinRoom";


export class RoomSelectionModule implements UIModule {
    manager: UIManager;
    rootElem: HTMLElement;
    listeners: {[key: string]: EventListenerOrEventListenerObject};

    constructor(manager: UIManager) {
        this.manager = manager;
        this.rootElem = document.querySelector('.room-selection');
        this.listeners = {};
    }

    initialize(): void {

        this.initializeNameForm();
        this.initializeRoomList();

        this.rootElem.style.display = 'initial';
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
            const name = input.value;
            this.manager.data.name = name;

            showNameDisplay(name);
        };
        this.listeners.changeNameButton = (event: Event) => {
            event.preventDefault();

            const name = this.manager.data.name;

            showNameInput(name);
        };

        if(this.manager.data.hasName()) {
            showNameDisplay(this.manager.data.name);
        } else {
            showNameInput('');
        }
    }

    private initializeRoomList() {
        this.refreshRoomList();
    }

    private async refreshRoomList() {
        const response = await RoomApi.list();
        if(response.status.type !== StatusType.success) {
            // TODO Show error
        } else {
            const roomList = response.content;
            const ul = document.createElement('ul');
            const template = document.querySelector('.list-room .room-item-template');

            roomList.forEach(r => {
                let item = instantiateTemplate(template as HTMLTemplateElement, {
                    '.room-name': r.name,
                    '.room-state': r.state === RoomState.Setup ? 'Mise en place' : r.state === RoomState.Playing ? 'En cours' : 'Fini',
                    '.room-noplayer': r.noplayers + ' Joueur(s)'
                });
                this.listeners['joinRoom_'+r.name] = (event: Event) => {
                    joinRoom(this.manager, r);
                };
                console.log(item);
                //item.querySelector('join-room').addEventListener('click', this.listeners['joinRoom_'+r.name]);
                ul.appendChild(item);
                console.log(ul.lastElementChild);
                ul.lastElementChild.querySelector('.join-room').addEventListener('click', this.listeners['joinRoom_'+r.name]);
            });

            const listHolder = document.querySelector('.list-room .room-list-holder');
            listHolder.innerHTML = '';
            listHolder.appendChild(ul);
        }
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
