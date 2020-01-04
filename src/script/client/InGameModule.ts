import {UIManager, UIModule} from "./UIManager";
import {LocationPopup} from "./LocationPopup";
import {SVGGenerator} from "./SVGGenerator";
import {getCssColor, Pawn, PawnArea} from "./PawnArea";
import {crel, instantiateTemplate, random} from "./Utilities";
import {Card, PawnColor} from "../common/Game/CharacterState";
import {PlayerDisplay} from "./PlayerDisplay";
import {AnimationQueue} from "./AnimationQueue";
import {PrettyLogger} from "./PrettyLogger";
import {ChoiceInterface} from "../common/Protocol/ChoiceInterface";
import {Chooser} from "./Chooser";
import {add, div, mul, norm, sub} from "./geometry/VectorOps";
import {Point} from "./geometry/Point";
import {Request, Update} from "../common/Protocol/SocketIOEvents";
import {CardPopup} from "./CardPopup";


export class InGameModule implements UIModule {
    manager: UIManager;
    rootElem: HTMLElement;
    listeners: {[key: string]: EventListenerOrEventListenerObject};
    playerDisplays: Array<PlayerDisplay>;
    animQueue: AnimationQueue;
    logger: PrettyLogger;
    chooser: Chooser;

    static healthPawnAreas: Array<PawnArea>;
    static locationPawnAreas: Array<PawnArea>;
    static middleArea: PawnArea;

    constructor(manager: UIManager) {
        this.manager = manager;
        this.rootElem = document.querySelector('.in-game');
        this.listeners = {};
        this.createPlayerDisplays();
        this.animQueue = new AnimationQueue();
        this.logger = new PrettyLogger(this);
        this.chooser = new Chooser(this);
    }

    createPlayerDisplays() {
        if(this.manager.game.board) {
            const board: HTMLElement = this.rootElem.querySelector(".board");
            this.playerDisplays = this.manager.game.players.filter(p => p.character).map(p => new PlayerDisplay(p.name, p.character, this, board, this.rootElem.querySelector('.player-list')));
            this.playerDisplays.find(pd => pd.character.id === this.manager.game.board.currentCharacterId).setCurrent(true);
        }
    }

    initialize(): void {
        this.initializeBoard();
        this.listeners.revealBtnClick = (e) => {
            this.manager.game.socket.emit(Request.Reveal.stub, Request.Reveal(this.manager.game.self));
            const btn = e.target as HTMLElement;
            btn.removeEventListener('click', this.listeners.revealBtnClick);
            btn.style.display = 'none';
        };

        this.rootElem.style.display = 'grid';
    }

    private initializeBoard() {
        this.resizeBoard();
        this.listeners.boardResize = () => {
            this.resizeBoard();
        };
        window.addEventListener('resize', this.listeners.boardResize);

        this.listeners.showLocation = (event) => {
            const target = event.target as HTMLElement;
            let index = -1;
            for (let i = 1; i <= 6; i++)
                if (target.classList.contains('loc' + i))
                    index = i;
            if (index === -1)
                return;
            this.manager.popup(new LocationPopup<void>(this.manager.game.board.locations[index - 1]));
        };
        this.rootElem.querySelectorAll('.board .locations .location').forEach((e: HTMLElement, index: number) => {
            e.addEventListener('click', this.listeners.showLocation);
            const image = SVGGenerator.locationCard(this.manager.game.board.locations[index]);
            image.style.width = '100%';
            image.style.height = '100%';
            image.style.pointerEvents = 'none';
            e.append(image);
        });
    }

    private resizeBoard() {
        let boardHeight = window.innerHeight * 0.6;
        const boardAspectRatio = 4 / 3;
        let boardWidth = boardHeight * boardAspectRatio;
        const otherBoardWidth = window.innerWidth * 0.75 - 100;
        if(boardWidth > otherBoardWidth) {
            // The width is the limiting factor
            boardWidth = otherBoardWidth;
            boardHeight = boardWidth / boardAspectRatio;
        }

        const board: HTMLElement = this.rootElem.querySelector('.board-container .board');
        board.style.height = boardHeight + 'px';
        board.style.width = boardWidth + 'px';
    }

    deinitialize(): void {
        this.rootElem.style.display = 'none';

        window.removeEventListener('resize', this.listeners.boardResize);
        this.rootElem.querySelectorAll('.board .locations .location').forEach((e: HTMLElement, index: number) => {
            e.removeEventListener('click', this.listeners.showLocation);
            e.innerHTML = '';
        });

        this.rootElem.querySelectorAll('.player-list > .player-info').forEach(e => {
            e.remove();
        });

        this.playerDisplays.forEach(pd => pd.cleanup());
        this.logger.cleanup();
        this.chooser.cleanup();
    }

    async choose(choice: ChoiceInterface) {
        await this.chooser.choose(choice);
    }

    setupRevealBtn() {
        const btn = this.rootElem.querySelector('.revealBtn') as HTMLElement;
        btn.addEventListener('click', this.listeners.revealBtnClick);
        btn.style.display = 'initial';
    }

    showCard(card: Card) {
        const cardDisplay = this.rootElem.querySelector('.card-display') as HTMLDivElement;
        cardDisplay.innerHTML = '';
        cardDisplay.append(SVGGenerator.card(card));
        cardDisplay.style.display = 'initial';
        cardDisplay.classList.add('clickable');
        if(this.listeners.cardDisplayClick)
            cardDisplay.removeEventListener('click', this.listeners.cardDisplayClick);
        this.listeners.cardDisplayClick = () => {
            this.manager.popup(new CardPopup(SVGGenerator.card(card)));
        };
        cardDisplay.addEventListener('click', this.listeners.cardDisplayClick);
    }

    hideCard() {
        const cardDisplay = this.rootElem.querySelector('.card-display') as HTMLDivElement;
        cardDisplay.innerHTML = '';
        cardDisplay.style.display = 'none';
        cardDisplay.classList.remove('clickable');
        cardDisplay.removeEventListener('click', this.listeners.cardDisplayClick);
        delete this.listeners.cardDisplayClick;
    }

}

InGameModule.healthPawnAreas = [
    new PawnArea([
        { x: 24.619910530442674, y: 18.51489618087642 },
        { x: 7.454489715070601, y: 13.405975413347369 },
        { x: 8.953736443151747, y: 4.608976771858363 },
        { x: 19.874557771721435, y: 4.911596446780009 },
        { x: 28.208496400451452, y: 13.40101166234292 }
    ]),
    new PawnArea([
        { x: 18.729712827726004, y: 33.5838734868175 },
        { x: 6.888220925123122, y: 26.726238634593575 },
        { x: 5.642211078111486, y: 17.97819095352537 },
        { x: 23.4571865828461, y: 24.803416654794727 }
    ]),
    new PawnArea([
        { x: 15.366288624258774, y: 45.63354095265696 },
        { x: 6.231986535309294, y: 42.013039139138556 },
        { x: 6.38629308849046, y: 34.93304952394294 },
        { x: 18.967500955539723, y: 39.81466561801759 }
    ]),
    new PawnArea([
        { x: 12.538393699711484, y: 56.29719482882845 },
        { x: 5.382536477547554, y: 58.055067762221555 },
        { x: 5.34967228206213, y: 48.99297571257516 },
        { x: 15.002530182954983, y: 49.28829426753131 }
    ]),
    new PawnArea([
        { x: 12.273711749418167, y: 68.7627089993324 },
        { x: 5.095995958959337, y: 69.8304961960448 },
        { x: 5.3504382604341885, y: 63.35011672951429 },
        { x: 12.61101280948581, y: 60.45491795015853 }
    ]),
    new PawnArea([
        { x: 12.970214981362108, y: 78.35539109011243 },
        { x: 6.57195693102053, y: 85.73775943322767 },
        { x: 4.964505611711233, y: 74.0237918832712 },
        { x: 12.644419003761616, y: 73.35564967116868 }
    ]),
    new PawnArea([
        { x: 16.97578012212139, y: 84.29475204682066 },
        { x: 16.649741881882232, y: 96.73527326761175 },
        { x: 7.839090085245259, y: 89.10883114088546 },
        { x: 15.240243642639463, y: 81.0043120183169 }
    ]),
    new PawnArea([
        { x: 23.626120430085514, y: 85.64554635252951 },
        { x: 26.453554087056144, y: 96.58728197743217 },
        { x: 18.74075706531912, y: 96.59365695982244 },
        { x: 19.26471478578814, y: 84.98892380194619 }
    ]),
    new PawnArea([
        { x: 35.529335479628315, y: 91.81695052597087 },
        { x: 28.569499361125246, y: 96.32381981108506 },
        { x: 26.155302535205838, y: 84.30639688512574 },
        { x: 28.830777500488136, y: 82.27768823624577 }
    ]),
    new PawnArea([
        { x: 37.09173447464308, y: 89.50864173257278 },
        { x: 30.33758183819527, y: 79.93518240213278 },
        { x: 30.955966583111646, y: 76.6546635007118 },
        { x: 39.85979393132947, y: 76.44463269021917 }
    ]),
    new PawnArea([
        { x: 39.61713597230201, y: 73.4872062468555 },
        { x: 30.962055482188628, y: 73.61023232986777 },
        { x: 30.974488943488815, y: 69.67171838368594 },
        { x: 36.72831235011313, y: 64.88663378671153 }
    ]),
    new PawnArea([
        { x: 35.37246273726207, y: 62.62540180684115 },
        { x: 29.79679029973788, y: 67.69475910670758 },
        { x: 29.45497001301892, y: 64.21884699507707 },
        { x: 29.109022475644537, y: 54.14220447918103 }
    ]),
    new PawnArea([
        { x: 25.56383321421135, y: 63.56452548357732 },
        { x: 19.865068933697888, y: 57.25800759266759 },
        { x: 26.6511107262587, y: 52.30246806021931 }
    ]),
    new PawnArea([
        { x: 23.22659866322916, y: 67.02981220438211 },
        { x: 18.422051349481194, y: 70.16922734978125 },
        { x: 18.77538627036851, y: 60.84187539226336 },
        { x: 22.868171968891176, y: 64.8182336891123 }
    ]),
    new PawnArea([
        { x: 24.776697133434894, y: 78.92871108371116 },
        { x: 21.94400206019478, y: 79.82660814864751 },
        { x: 19.652434504044987, y: 77.25559995934368 },
        { x: 19.33842785366129, y: 73.537982934776 },
        { x: 23.94725024329187, y: 71.15164125825278 },
        { x: 26.407104786203885, y: 73.70917339657186 }
    ])
];

InGameModule.locationPawnAreas = [
    new PawnArea([
        { x: 59.96566728445458, y: 91.14642799060547 },
        { x: 48.98884416887153, y: 91.11098808275138 },
        { x: 48.775334458961865, y: 80.84875693216331 },
        { x: 59.56841964436009, y: 81.36059963766225 }
    ]),
    new PawnArea([
        { x: 76.25795816220129, y: 91.37149088963884 },
        { x: 65.21423236123184, y: 91.53926142063318 },
        { x: 65.15430522513135, y: 81.17507045107934 },
        { x: 76.56093892953545, y: 80.3685966039783 }
    ]),
    new PawnArea([
        { x: 94.56769330363285, y: 44.275704288589324 },
        { x: 87.03449487581823, y: 48.646987314329394 },
        { x: 83.48501974680903, y: 34.23889857078092 },
        { x: 90.66886765757071, y: 29.851368668550382 }
    ]),
    new PawnArea([
        { x: 88.82560031427562, y: 22.36510521427114 },
        { x: 81.20606355695585, y: 26.888407331246682 },
        { x: 77.51982564856728, y: 12.454530272445739 },
        { x: 85.15968995791496, y: 8.437555011096501 }
    ]),
    new PawnArea([
        { x: 42.757441559731575, y: 26.520658235127538 },
        { x: 35.33359675660728, y: 22.48806462316505 },
        { x: 39.25958230441635, y: 8.450437779858257 },
        { x: 46.35717407355309, y: 11.989204858408087 }
    ]),
    new PawnArea([
        { x: 37.40795568479857, y: 48.655601524894294 },
        { x: 29.862816894610305, y: 44.581503842728544 },
        { x: 33.5644761379214, y: 30.209858477250243 },
        { x: 40.545108693608064, y: 33.96972372041124 }
    ])
];

InGameModule.middleArea = new PawnArea([
   { x: 47.923584897829166, y: 60.409746631449224 },
   { x: 62.250827241171045, y: 16.943524401641724 },
   { x: 74.9169400374588, y: 60.13289171278803 }
]);

// Utility script for building the pawn areas
// const pointManager = {
//     points: [],
//     addPoint(x: number, y: number) {
//         this.points.push(new Point(x, y));
//     },
//     finishPolygon() {
//         const middle = div(this.points.reduce((a,b) => add(a, b)), this.points.length);
//         const newPoints = this.points.map(p => {
//             const vec = sub(p, middle);
//             const currentDistance = norm(vec);
//             const wantedDistance = Math.max(currentDistance - 2.25, 0);
//             const wantedVec = mul(vec, wantedDistance / currentDistance);
//             return add(middle, wantedVec);
//         });
//         const string = newPoints.map(p => {
//             return `    { x: ${p.x}, y: ${p.y} }`;
//         }).join(',\n');
//         console.log('new PawnArea([\n' + string + '\n])');
//         this.points = [];
//     }
// };
//
// document.querySelector('.board').addEventListener('click', (e: MouseEvent) => {
//     const board = document.querySelector('.board');
//     const left = e.clientX - board.getBoundingClientRect().left;
//     const top = e.clientY - board.getBoundingClientRect().top;
//     const x = left / board.getBoundingClientRect().width * 100;
//     const y = 100 - top / board.getBoundingClientRect().height * 100;
//     pointManager.addPoint(x, y);
// });
//
// window.addEventListener('keypress', (e: KeyboardEvent) => {
//     if(e.key.toLowerCase() === 'a') {
//         pointManager.finishPolygon();
//     }
// });
