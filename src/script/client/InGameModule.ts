import {UIManager, UIModule} from "./UIManager";
import {LocationPopup} from "./LocationPopup";


export class InGameModule implements UIModule {
    manager: UIManager;
    rootElem: HTMLElement;
    listeners: {[key: string]: EventListenerOrEventListenerObject};

    constructor(manager: UIManager) {
        this.manager = manager;
        this.rootElem = document.querySelector('.in-game');
        this.listeners = {};
    }

    initialize(): void {
        this.resizeBoard();
        this.listeners.boardResize = () => {
            this.resizeBoard();
        };
        window.addEventListener('resize', this.listeners.boardResize);

        this.listeners.showLocation = (event) => {
            const target = event.target as HTMLElement;
            let index = -1;
            for(let i = 1; i <= 6; i++)
                if(target.classList.contains('loc'+i))
                    index = i;
            if(index === -1)
                return;
            this.manager.popup(new LocationPopup<void>(this.manager.game.board.locations[index-1]));
        };
        this.rootElem.querySelectorAll('.board .locations .location').forEach(e => {
            e.addEventListener('click', this.listeners.showLocation);
        });


        this.rootElem.style.display = 'grid';
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
    }

}
