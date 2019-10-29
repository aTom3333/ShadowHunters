import {UIManager, UIModule} from "./UIManager";
import {LocationPopup} from "./LocationPopup";
import {SVGGenerator} from "./SVGGenerator";
import {getCssColor, PawnArea} from "./PawnArea";
import {crel, random} from "./Utilities";
import {PawnColor} from "../common/Game/CharacterState";


export class InGameModule implements UIModule {
    manager: UIManager;
    rootElem: HTMLElement;
    listeners: {[key: string]: EventListenerOrEventListenerObject};
    static healthPawnAreas: Array<PawnArea>;

    constructor(manager: UIManager) {
        this.manager = manager;
        this.rootElem = document.querySelector('.in-game');
        this.listeners = {};
    }

    initialize(): void {
        this.initializeBoard();
        this.manager.game.players.forEach(p => {
            //const locIdx = this.manager.game.board.locations.indexOf(p.character.location);
            InGameModule.healthPawnAreas[p.character.lostHp].add(p.character.pawnColor);
        });

        InGameModule.healthPawnAreas.forEach(area => {
            area.pawns.forEach(p => {
                this.rootElem.querySelector('.board').append(crel.div({
                    'class': 'pawn',
                    style: {
                        top: (100-p.coord.y) + '%',
                        left: p.coord.x + '%',
                        transform: 'translate(-50%, -50%) rotate(' + random(0, 360) + 'deg)',
                        'background-color': getCssColor(p.color)
                    }
                }));
                console.log('ajout pion');
            });
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
    }

}

InGameModule.healthPawnAreas = [
    new PawnArea([
        { x: 22.96098687568321, y: 19.62174795924966 },
        { x: 7.003540498894753, y: 12.529549249771677 },
        { x: 8.776590096315692, y: 3.073284303801046 },
        { x: 29.60992286601174, y: 9.869974733717441 }
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
    new PawnArea([]),
    new PawnArea([]),
];
