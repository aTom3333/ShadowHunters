import {InGameModule} from "./InGameModule";
import {ChoiceInterface} from "../common/Protocol/ChoiceInterface";
import {crel} from "./Utilities";
import {Response} from "../common/Protocol/SocketIOEvents";
import {Location} from "../common/Game/CharacterState";
import {PlayerDisplay} from "./PlayerDisplay";


interface PlayerSummary {
    name: string;
    id: number;
}

type Target = PlayerSummary | Array<PlayerSummary>;

export class Chooser {
    module: InGameModule;
    root: HTMLElement;

    constructor(module: InGameModule) {
        this.module = module;
        this.root = document.querySelector('.in-game .input .choices');
    }

    async choose(choice: ChoiceInterface) {
        switch (choice.type) {
            case 'generic':
                await this.buildChoice(choice, this.createButtonBuilder());
                break;

            case 'location':
                const locationBuilder = this.createButtonBuilder((l: Location) => l.name);
                await this.buildChoice(choice, (choice: Location, resolve: {()}) => {
                    const btn = locationBuilder(choice, resolve);
                    const locIdx = this.module.manager.game.board.locations.findIndex(l => l.name === choice.name);
                    const locElement = document.querySelector('.board .loc'+(locIdx+1));
                    btn.addEventListener('mouseenter', () => {
                        locElement.classList.add('hover');
                    });
                    btn.addEventListener('mouseleave', () => {
                        locElement.classList.remove('hover');
                    });
                    btn.addEventListener('click', () => {
                        locElement.classList.remove('hover');
                    });

                    return btn;
                });
                break;

            case 'target':
                const targetBuilder = this.createButtonBuilder((t: Target) => {
                    return t === null ? 'Ne pas attaquer' : t instanceof Array ? t.map(p => p.name).join(', ') : t.name;
                });
                await this.buildChoice(choice, (choice: Target, resolve: {()}) => {
                    const btn = targetBuilder(choice, resolve);
                    if(choice !== null) {
                        let targetDisplays: Array<PlayerDisplay>;
                        if (choice instanceof Array)
                            targetDisplays = this.module.playerDisplays.filter(pd => choice.find(p => p.name === pd.name));
                        else
                            targetDisplays = [this.module.playerDisplays.find(pd => pd.name === choice.name)];
                        btn.addEventListener('mouseenter', () => {
                            targetDisplays.forEach(e => e.startHover());
                        });
                        btn.addEventListener('mouseleave', () => {
                            targetDisplays.forEach(e => e.endHover());
                        });
                        btn.addEventListener('click', () => {
                            targetDisplays.forEach(e => e.endHover());
                        });
                    }
                    return btn;
                });
                break;

            case 'confirmation':
                await this.confirmation(choice);
        }
    }

    private createButtonBuilder<T>(getText: {(el: T): string} = el => el.toString()) {
        return (choice: any, resolve: {()}) => {
            const btn = crel.button({
                'class': 'choice'
            }, getText(choice));
            btn.addEventListener('click', () => {
                // Send choice
                this.module.manager.game.socket.emit(Response.Choice.stub, Response.Choice(choice));
                // Clean
                this.cleanup();
                resolve();
            });
            return btn;
        };
    }

    private buildChoice(choice: ChoiceInterface, choiceBuilder: {(choice: any, resolve: {()}): Element}): Promise<void> {
        return new Promise<void>((resolve => {
            const choices = choice.choices as Array<string>;
            this.root.innerHTML = '';
            this.root.append(crel.h3({}, choice.title),
                crel.div({},
                    choices.map(c => {
                        return choiceBuilder(c, resolve);
                    })
                )
            );
        }));
    }

    private confirmation(choice: ChoiceInterface) {

    }

    cleanup() {
        this.root.innerHTML = '';
    }
}
