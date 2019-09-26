import {Board} from "../common/Game/Board";
import {Character} from "../common/Game/Character";
import {UIManager} from "./UIManager";
import {CharacterState} from "../common/Game/CharacterState";


export class Player {
    name: string;
    character: CharacterState;
}

export class GameManager {
    board: Board;
    selfId: number;
    socket;
    ui: UIManager;
    players: Array<Player>;
    self: Player;

    constructor(socket, dataReceived: any /* TODO Replace by the same type than server's Room::serializeState() */, ui: UIManager) {
        this.socket = socket;
        this.selfId = null;
        this.ui = ui;
        this.players = [];

        // TODO Get players from dataReceived
        if(dataReceived.board !== null) {
            this.players = dataReceived.players.map(data => {
                return {
                    name: data.name,
                    character: dataReceived.board.states.find(c => c.id === data.id)
                };
            });

            // Game has already started
            this.board = dataReceived.board;
            this.socket.once('update:ownidentity', (identity: any) => {
                this.selfId = identity.id;
                this.addCharacterData(identity);
                console.log('I am ');
                console.log(this.board.states.find(c => c.id === this.selfId));
            });
        } else {
            this.players = dataReceived.players.map(data => {
                return {
                    name: data.name,
                    character: null
                }
            });

            this.socket.on('update:gamestarted', (data: any) => {
                this.board = data.board;
                this.socket.once('update:ownidentity', (identity: any) => {
                    this.selfId = identity.id;
                    this.addCharacterData(identity);
                    console.log('I am ');
                    console.log(this.board.states.find(c => c.id === this.selfId));
                });
            });
        }

        this.self = this.players.find(p => p.name === this.ui.data.name);

        if(!this.self) {
            // TODO Show error
            return;
        }

        this.setupListeners();
    }

    setupListeners() {
        // TODO Listen for everything that makes sense
        this.socket.on('error', error => {
            this.ui.error(error);
        });

        this.socket.on('update:playerjoined', (player: Player) => { // TODO type
            if(this.players.find(p => p.name === player.name)) {
                // New socket for existing player
                // Could log that if wanted
            } else {
                this.players.push(player);
                this.ui.log(player.name + ' entre dans la salle');
                this.ui.updatePlayerList(this.players);
            }
        });

        this.socket.on('update:playerleave', (player: Player) => {
            const player_idx = this.players.findIndex(p => p.name === player.name);
            this.players.splice(player_idx, 1);
            this.ui.log(player.name + ' sort de la salle');
            this.ui.updatePlayerList(this.players);
        });
    }

    private addCharacterData(data: any) {
        const revealedCharacter = this.board.states.find(c => c.id === data.id);
        revealedCharacter.identity = data.identity;
    }

    destroy() {
        this.socket.close();
    }
}
