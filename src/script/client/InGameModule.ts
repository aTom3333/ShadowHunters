import {UIManager, UIModule} from "./UIManager";
import {LocationPopup} from "./LocationPopup";
import {SVGGenerator} from "./SVGGenerator";
import {getCssColor, Pawn, PawnArea} from "./PawnArea";
import {crel, random} from "./Utilities";
import {PawnColor} from "../common/Game/CharacterState";
import {PlayerDisplay} from "./PlayerDisplay";
import {AnimationQueue} from "./AnimationQueue";


export class InGameModule implements UIModule {
    manager: UIManager;
    rootElem: HTMLElement;
    listeners: {[key: string]: EventListenerOrEventListenerObject};
    playerDisplays: Array<PlayerDisplay>;
    animQueue: AnimationQueue;

    static healthPawnAreas: Array<PawnArea>;
    static locationPawnAreas: Array<PawnArea>;
    static middleArea: PawnArea;

    constructor(manager: UIManager) {
        this.manager = manager;
        this.rootElem = document.querySelector('.in-game');
        this.listeners = {};
        this.createPlayerDisplays();
        this.animQueue = new AnimationQueue();
    }

    createPlayerDisplays() {
        if(this.manager.game.board) {
            const board: HTMLElement = this.rootElem.querySelector(".board");
            this.playerDisplays = this.manager.game.players.map(p => new PlayerDisplay(p.name, p.character, this, board));
        }
    }

    initialize(): void {
        this.initializeBoard();
        this.manager.game.players.forEach(p => {

        });

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

        this.playerDisplays.forEach(pd => pd.cleanup());
    }

}

InGameModule.healthPawnAreas = [
    new PawnArea([
        { x: 22.96098687568321, y: 19.62174795924966 },
        { x: 7.003540498894753, y: 12.529549249771677 },
        { x: 8.776590096315692, y: 3.073284303801046 },
        { x: 29.60992286601174, y: 9.869974733717441 }
    ]),
    new PawnArea([
        { x: 20.212183503622136, y: 34.71164598105541 },
        { x: 5.522303442849319, y: 26.91331480657037 },
        { x: 4.570181587058488, y: 18.208200937377754 },
        { x: 25.516862414456764, y: 25.82517557292128 }
    ]),
    new PawnArea([
        { x: 16.67573089639905, y: 46.49982101225374 },
        { x: 4.026111955178013, y: 43.235403311306506 },
        { x: 5.3862860348792, y: 34.16757636423088 },
        { x: 20.076166095652017, y: 40.87776830506685 }
    ]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
    new PawnArea([]),
];

// TODO Better polygons
InGameModule.locationPawnAreas = [
    new PawnArea([
        { x: 60.986339137161686, y: 93.48958359203404 },
        { x: 48.04688620497456, y: 92.83854195123745 },
        { x: 47.80274558361254, y: 75.91145929052594 },
        { x: 60.742198515799664, y: 75.26041764972935 }
    ]),
    new PawnArea([
        { x: 77.34376076841711, y: 92.51302113083915 },
        { x: 64.16016721486795, y: 92.51302113083915 },
        { x: 63.91602659350594, y: 77.21354257211914 },
        { x: 77.58790138977913, y: 76.23698011092424 }
    ]),
    new PawnArea([
        { x: 77.34376076841711, y: 54.42708514423827 },
        { x: 72.46094834117667, y: 38.15104412432336 },
        { x: 84.42383878791573, y: 31.6406277163574 },
        { x: 89.7949324578802, y: 48.8932311974672 }
    ]),
    new PawnArea([
        { x: 71.72852647709061, y: 30.664065255162512 },
        { x: 67.57813591393625, y: 15.690107516840783 },
        { x: 80.02930760339935, y: 12.434899312857823 },
        { x: 84.42383878791573, y: 27.083336230781228 }
    ]),
    new PawnArea([
        { x: 52.19727676812892, y: 33.59375263874719 },
        { x: 41.45508942819999, y: 27.73437787157782 },
        { x: 46.09376123407839, y: 9.830732749671427 },
        { x: 57.81251105945541, y: 15.690107516840783 }
    ]),
    new PawnArea([
        { x: 47.55860496225052, y: 55.07812678503486 },
        { x: 35.35157389414945, y: 49.544272838263794 },
        { x: 39.99024570002786, y: 32.29166935715399 },
        { x: 51.46485490404286, y: 37.17448166312847 }
    ]),
];

InGameModule.middleArea = new PawnArea([
   { x: 47.923584897829166, y: 60.409746631449224 },
   { x: 62.250827241171045, y: 16.943524401641724 },
   { x: 74.9169400374588, y: 60.13289171278803 }
]);
