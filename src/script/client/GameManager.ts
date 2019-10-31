import {Board} from "../common/Game/Board";
import {UIManager, UIState} from "./UIManager";
import {CharacterState} from "../common/Game/CharacterState";
import {Dice, Update} from "../common/Protocol/SocketIOEvents";
import {FullRoom} from "../common/Protocol/RoomInterface";
import {AddDices, Dice4, Dice6, SubtractDices} from "../common/Event/DiceResult";
import {PlayerInterface} from "../common/Protocol/PlayerInterface";
import {InGameModule} from "./InGameModule";
import {MovementAnimation} from "./Animations/MovementAnimation";
import {DiceAnimationAdd} from "./Animations/DiceAnimation";


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

    constructor(socket, dataReceived: FullRoom, ui: UIManager) {
        this.socket = socket;
        this.selfId = null;
        this.ui = ui;
        this.players = [];

        if(dataReceived.board) {
            this.players = dataReceived.players.map(data => {
                return {
                    name: data.name,
                    character: dataReceived.board.states.find(c => c.id === data.id)
                };
            });

            // Game has already started
            this.board = dataReceived.board;
            this.socket.once(Update.OwnIdentity.stub, (identity: any) => {
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

            this.socket.on(Update.GameStarted.stub, (data: FullRoom) => {
                this.board = data.board;
                this.players = data.players.map(p => {
                    return {
                        name: p.name,
                        character: this.board.states.find(c => c.id === p.id)
                    };
                });
                this.self = this.players.find(p => p.name === this.ui.data.name);
                this.socket.once(Update.OwnIdentity.stub, (identity: CharacterState) => {
                    this.selfId = identity.id;
                    this.addCharacterData(identity);
                    console.log('I am ');
                    console.log(this.board.states.find(c => c.id === this.selfId));
                });
                this.ui.switchTo(UIState.InGame);
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

        this.socket.on(Update.PlayerJoined.stub, (player: Player) => {
            if(this.players.find(p => p.name === player.name)) {
                // New socket for existing player
                // Could log that if wanted
            } else {
                this.players.push(player);
                this.ui.log(player.name + ' entre dans la salle');
                this.ui.updatePlayerList(this.players);
            }
        });

        this.socket.on(Update.PlayerLeft.stub, (player: Player) => {
            const player_idx = this.players.findIndex(p => p.name === player.name);
            this.players.splice(player_idx, 1);
            this.ui.log(player.name + ' sort de la salle');
            this.ui.updatePlayerList(this.players);
        });

        this.socket.on(Dice.D4.stub, (dice: Dice4) => {
            this.ui.log('{0} lance un dé', dice.player);
            this.ui.queue({ execute() { console.log(dice.value); } });
        });

        this.socket.on(Dice.D4.stub, (dice: Dice6) => {
            this.ui.log('{0} lance un dé', dice.player);
            this.ui.queue({ execute() { console.log(dice.value); } });
        });

        this.socket.on(Dice.Add.stub, (dice: AddDices) => {
            this.ui.queue(new DiceAnimationAdd(dice, this.ui));
        });

        this.socket.on(Dice.Sub.stub, (dice: SubtractDices) => {
            this.ui.log('{0} lance des dés', dice.player);
            this.ui.queue({ execute() { console.log(Math.abs(dice.d4.value - dice.d6.value)); } });
        });

        this.socket.on(Update.Movement.stub, (player: PlayerInterface) => {
            this.ui.queue(new MovementAnimation(player, this.ui));
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
