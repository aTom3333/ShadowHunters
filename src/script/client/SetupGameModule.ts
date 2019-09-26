import {UIManager, UIModule} from "./UIManager";
import {Player} from "./GameManager";
import {instantiateTemplate} from "./Utilities";
import {RoomState} from "../common/Protocol/RoomInterface";
import {joinRoom} from "./JoinRoom";


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
        this.updatePlayerList(this.manager.game.players);

        this.listeners.startGameButton = (event: Event) => {
            event.preventDefault();
            // TODO Show popup asking for composition
            this.manager.game.socket.emit('request:startgame', {});
        };
        this.rootElem.querySelector('.start-game .start-game-button').addEventListener('click', this.listeners.startGameButton);

        this.rootElem.style.display = 'initial';
    }

    deinitialize(): void {
        this.rootElem.style.display = 'none';

        this.rootElem.querySelector('.start-game .start-game-button').removeEventListener('click', this.listeners.startGameButton);
    }

    updatePlayerList(players: Array<Player>) {
        const ul = document.createElement('ul');
        const template = this.rootElem.querySelector('.list-player .player-item-template');

        players.sort((a,b) => {
            return a.name.localeCompare(b.name);
        }).forEach(p => {
            let item = instantiateTemplate(template as HTMLTemplateElement, {
                '.player-name': p.name
            });
            if(p.name === this.manager.data.name)
                item.querySelector('.player-name').classList.add('self');
            ul.appendChild(item);
        });

        const listHolder = this.rootElem.querySelector('.list-player .player-list-holder');
        listHolder.innerHTML = '';
        listHolder.appendChild(ul);
    }
}
