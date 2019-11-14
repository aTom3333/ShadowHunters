import {Board, TurnStep} from "../common/Game/Board";
import {UIManager, UIState} from "./UIManager";
import {Card, CardColor, CharacterState, Equipment} from "../common/Game/CharacterState";
import {Debug, Dice, Request, Update} from "../common/Protocol/SocketIOEvents";
import {FullRoom} from "../common/Protocol/RoomInterface";
import {AddDices, Dice4, Dice6, SubtractDices} from "../common/Event/DiceResult";
import {PlayerInterface} from "../common/Protocol/PlayerInterface";
import {MovementAnimation} from "./Animations/MovementAnimation";
import {DiceAnimation4, DiceAnimation6, DiceAnimationAdd, DiceAnimationSub} from "./Animations/DiceAnimation";
import {ChoiceInterface} from "../common/Protocol/ChoiceInterface";
import {ChoiceAnimation} from "./Animations/ChoiceAnimation";
import {getDifference} from "../common/Utility/Compare";
import {AttackAnimation} from "./Animations/AttackAnimation";
import {InGameModule} from "./InGameModule";
import {sleep} from "./Utilities";
import {GameOverAnimation} from "./Animations/GameOverAnimation";


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
                this.addCharacterData(identity, true);
                console.log('I am ');
                console.log(this.board.states.find(c => c.id === this.selfId));

                if(dataReceived.winners !== null) {
                    this.ui.queue(new GameOverAnimation(dataReceived, this.ui));
                }
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
                    this.addCharacterData(identity, true);
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

        // TODO Correct events
        this.socket.on(Dice.D4.stub, (dice: Dice4) => {
            this.ui.queue(new DiceAnimation4(dice, this.ui));
        });

        this.socket.on(Dice.D4.stub, (dice: Dice6) => {
            this.ui.queue(new DiceAnimation6(dice, this.ui));
        });

        this.socket.on(Dice.Add.stub, (dice: AddDices) => {
            this.ui.queue(new DiceAnimationAdd(dice, this.ui));
        });

        this.socket.on(Dice.Sub.stub, (dice: SubtractDices) => {
            this.ui.queue(new DiceAnimationSub(dice, this.ui));
        });

        this.socket.on(Update.Movement.stub, (player: PlayerInterface) => {
            this.ui.queue(new MovementAnimation(player, this.ui));
        });

        this.socket.on(Request.Choice.stub, (choice: ChoiceInterface) => {
            this.ui.queue(new ChoiceAnimation(choice, this.ui));
        });

        this.socket.on(Update.TurnStart.stub, (player: string) => {
            this.ui.queue({ execute: () => {
                    const charId = this.ui.game.players.find(p => p.name === player).character.id;
                    this.ui.game.board.currentCharacterId = charId;
                    this.ui.log('Au tour de {0:player}', {name: player});
                    (this.ui.module as InGameModule).playerDisplays.forEach(pd => { pd.setCurrent(false); });
                    (this.ui.module as InGameModule).playerDisplays.find(pd => pd.character.id === charId).setCurrent(true);
                }});
        });

        this.socket.on(Update.DrawCard.stub, (info: {card: Card, player: PlayerInterface}) => {
            this.ui.queue({ execute: async () => {
                switch(info.card.color) {
                    case CardColor.Green:
                        this.ui.log('{0:player} tire une carte Vision', info.player);
                        this.ui.game.board.greenDeck.numberLeft--;
                        break;

                    case CardColor.Black:
                        this.ui.log('{0:player} tire une carte {1} : {2}', info.player, 'Ténèbre', info.card.name);
                        this.ui.game.board.blackDeck.numberLeft--;
                        // TODO Afficher carte
                        break;

                    case CardColor.White:
                        this.ui.log('{0:player} tire une carte {1} : {2}', info.player, 'Lumière', info.card.name);
                        this.ui.game.board.whiteDeck.numberLeft--;
                        // TODO Afficher carte
                        break;
                }
            }});
        });

        this.socket.on(Update.Equip.stub, (info: {player: PlayerInterface, equipment: Equipment}) => {
            this.ui.queue({ execute: () => {
                this.ui.log('{0:player} équipe {1}', info.player, info.equipment.name);
                this.ui.game.board.states.find(c => c.id === info.player.character.id).equipment.push(info.equipment);
            }});
        });

        this.socket.on(Update.Attack.stub, (info: {attacker: PlayerInterface, target: PlayerInterface, type: string}) => {
            this.ui.queue(new AttackAnimation(info, this.ui));
        });

        this.socket.on(Update.ChangeHP.stub, (info: {player: PlayerInterface, type: string, amount: number}) => {
            this.ui.queue({
                execute: async () => {
                    switch (info.type) {
                        case '-':
                            this.ui.log('{0:player} a pris {1} Blessures', info.player, info.amount);
                            this.ui.game.board.states.find(c => c.id === info.player.character.id).lostHp += info.amount;
                            break;
                        case '+':
                            this.ui.log('{0:player} est soigné de {1} Blessures', info.player, info.amount);
                            this.ui.game.board.states.find(c => c.id === info.player.character.id).lostHp -= info.amount;
                            break;
                        case '=':
                            this.ui.log('{0:player} est à {0} Blessures', info.player, info.amount);
                            this.ui.game.board.states.find(c => c.id === info.player.character.id).lostHp = info.amount;
                            break;
                    }
                    (this.ui.module as InGameModule).playerDisplays.find(pd => pd.character.id === info.player.character.id).updateHP();
                    await sleep(1000);
                }
            })
        });

        this.socket.on(Update.UsePower.stub, (player: PlayerInterface) => {
            this.ui.queue({
                execute: () => {
                    this.ui.log('{0:player} utilise son pouvoir', player);
                    this.board.states.find(c => c.id === player.character.id).powerUsed = true;
                }
            });
        });

        this.socket.on(Update.Dead.stub, (info: {target: PlayerInterface, killer: PlayerInterface}) => {
            this.ui.queue({
                execute: async () => {
                    this.ui.log('{0:player} est mort', info.target);
                    this.addCharacterData(info.target.character);
                    const chara = this.board.states.find(c => c.id === info.target.character.id);
                    chara.dead = true;
                    chara.killerId = info.killer.character.id;
                    const pd = (this.ui.module as InGameModule).playerDisplays.find(pd => pd.character.id === info.target.character.id);
                    pd.updateHP();
                    pd.updateLocation();
                    await sleep(1000);
                }
            });
        });

        this.socket.on(Update.GameOver.stub, (room: FullRoom) => {
            this.ui.queue(new GameOverAnimation(room, this.ui));
        });

        this.socket.on(Update.Message.stub, (info: { msg: string, params: Array<any>}) => {
            this.ui.queue({
                execute: async () => {
                    this.ui.log(info.msg, ...info.params);
                }
            })
        });

        this.socket.on(Update.Reveal.stub, (player: PlayerInterface) => {
            this.ui.queue({
                execute: async () => {
                    this.ui.log('{0:player} se révèle', player);
                    this.addCharacterData(player.character);
                    this.players.find(p => p.name === player.name).character.revealed = true;
                    (this.ui.module as InGameModule).playerDisplays.find(pd => pd.name === player.name).updateCharacter();
                }
            });
        });



        this.socket.on(Debug.CheckState.stub, (room: FullRoom) => {
            this.ui.queue({ execute: () => {
                const res = getDifference(this.ui.game.board, room.board);
                if(res !== null) {
                    this.ui.error('Difference in board'+res.join(''));
                    console.log('client: ', this.ui.game.board);
                    console.log('server: ', room.board);
                }
            }});
        })
    }

    addCharacterData(data: CharacterState, isSelf: boolean = false) {
        const revealedCharacter = this.board.states.find(c => c.id === data.id);
        revealedCharacter.identity = data.identity;
        const playerDisplay = (this.ui.module as InGameModule).playerDisplays.find(pd => pd.character.id === data.id);
        playerDisplay.updateCharacter();
        if(isSelf) {
            playerDisplay.setSelf();
            if(!data.revealed)
                (this.ui.module as InGameModule).setupRevealBtn();
        }
    }

    destroy() {
        this.socket.close();
    }
}
