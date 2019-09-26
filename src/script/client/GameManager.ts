import {Board} from "../common/Game/Board";
import {Character} from "../common/Game/Character";
import {UIManager} from "./UIManager";


export class GameManager {
    board: Board;
    selfId: number;
    socket;
    ui: UIManager;

    constructor(socket, dataReceived: any /* TODO Replace by the same type than server's Room::serializeState() */, ui: UIManager) {
        this.socket = socket;
        this.selfId = null;
        this.ui = ui;
        if(dataReceived.board !== null) {
            // Game has already started
            this.board = dataReceived.board;
            this.socket.once('update:ownidentity', (identity: any) => {
                this.selfId = identity.id;
                this.addCharacterData(identity);
                console.log('I am ');
                console.log(this.board.states.find(c => c.id === this.selfId));
            });
            this.setupListeners();

        } else {
            this.socket.on('update:gamestarted', (data: any) => {
                this.board = data.board;
                this.socket.once('update:ownidentity', (identity: any) => {
                    this.selfId = identity.id;
                    this.addCharacterData(identity);
                    console.log('I am ');
                    console.log(this.board.states.find(c => c.id === this.selfId));
                });
            });
            console.log('listening');
        }
    }

    setupListeners() {
        // TODO Listen for everything that makes sense
    }

    private addCharacterData(data: any) {
        const revealedCharacter = this.board.states.find(c => c.id === data.id);
        revealedCharacter.identity = data.identity;
    }

    destroy() {
        this.socket.close();
    }
}
