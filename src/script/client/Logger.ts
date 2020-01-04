import {crel} from "./Utilities";
import {PlayerDisplay} from "./PlayerDisplay";
import {Card, Equipment, Location} from "../common/Game/CharacterState";


type Applicator = {(elems: Array<string|Element>): void};

export class Logger {
    transformers: {[key: string]: {(arg: any):string|Element } };
    apply: Applicator;

    constructor(apply: Applicator) {
        this.apply = apply;
        this.transformers = {};
    }

    transform(format: string, ...args: Array<any>): Array<string|Element> {
        const tokens = format.split(/({\d+(?::[a-zA-Z0-9_-]+)?})/);
        return tokens.map(t => {
            const simpleArg = /^{(\d+)}$/.exec(t);
            if(simpleArg) {
                const idx = +simpleArg[1];
                if(idx < args.length) {
                    return args[idx];
                } else {
                    return t;
                }
            }

            const customArg = /^{(\d+):([a-zA-Z0-9_-]+)}$/.exec(t);
            if(customArg) {
                const idx = +customArg[1];
                if(idx >= args.length)
                    return t;
                const type = customArg[2];
                if(type in this.transformers) {
                    return this.transformers[type](args[idx]);
                } else {
                    return '?';
                }
            }

            return t;
        });
    }

    log(format: string, ...args: Array<any>): void {
        const transformed = this.transform(format, ...args);
        this.apply(transformed);
    }
}

export class ConsoleLogger extends Logger {
    constructor() {
        super((elems: Array<string|Element>) => {
            console.log(elems.map(e => e instanceof Element ? e.textContent : e).reduce((a, b) => a+b));
        });

        this.transformers.player = (player: PlayerDisplay) => {
            return player.name;
        };
        this.transformers.location = (location: Location) => {
            return location.name;
        };
        this.transformers.equipment = (equipment: Equipment) => {
            return equipment.name;
        };
        this.transformers.card = (card: Card) => {
            return card.name;
        };
    }
}
