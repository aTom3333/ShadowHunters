import {Quadgon} from "./geometry/Quadgon";
import {Point, PointLike} from "./geometry/Point";
import {norm, sub} from "./geometry/VectorOps";
import {PawnColor} from "../common/Game/CharacterState";
import {crel, random} from "./Utilities";


export function getCssColor(c: PawnColor): string {
    switch (c) {
        case PawnColor.Black:
            return '#2a2a2a';
        case PawnColor.Blue:
            return '#396aff';
        case PawnColor.Purple:
            return '#540b9e';
        case PawnColor.Red:
            return '#e10400';
        case PawnColor.Green:
            return '#04a219';
        case PawnColor.White:
            return '#f2f2f2';
        case PawnColor.Yellow:
            return '#e8d500';
        case PawnColor.Orange:
            return '#e85400';
    }
}

export class Pawn {
    coord: Point;
    color: PawnColor;
    area: PawnArea;
    visual: HTMLElement;

    constructor(color: PawnColor) {
        this.color = color;
        this.coord = null;
        this.area = null;
    }

    collidesWith(other: Pawn) {
        return norm(sub(other.coord, this.coord)) < 4.5;
    }

    setCoord(coord: Point) {
        this.coord = coord;
        if(this.visual) {
            this.visual.style.top = `${100-this.coord.y}%`;
            this.visual.style.left = `${this.coord.x}%`;
        }
    }

    show(root: HTMLElement) {
        if(!this.visual) {
            this.visual = crel.div({
                'class': 'pawn',
                style: {
                    top: (100-this.coord.y) + '%',
                    left: this.coord.x + '%',
                    transform: 'translate(-50%, -50%) rotate(' + random(0, 360) + 'deg)',
                    'background-color': getCssColor(this.color)
                }
            });
            root.append(this.visual)
        }
    }

    changeRotation() {
        if(this.visual)
            this.visual.style.transform = 'translate(-50%, -50%) rotate(' + random(0, 360) + 'deg)';
    }

    hide() {
        if(this.visual) {
            this.visual.remove();
            this.visual = null;
        }
    }

    moveTo(area: PawnArea) {
        if(area === this.area)
            return;
        if(this.area)
            this.area.remove(this);
        area.add(this);
    }
}

export class PawnArea {
    private area: Quadgon;
    pawns: Array<Pawn>;

    constructor(points: Array<PointLike>) {
        this.area = new Quadgon(points.map(p => Point.fromPointLIke(p)))
        this.pawns = [];
    }

    add(pawn: Pawn) {
        if(pawn.area && pawn.area !== this)
            pawn.area.remove(pawn);
        const maxTries = 10;
        const dummy = new Pawn( pawn.color);
        for(let i = 0; i < maxTries; i++) {
            dummy.coord = this.area.randomPointInside();
            if(!this.pawns.map(p => p.collidesWith(dummy)).reduce((a,b) => a||b, false)) {
                break;
            }
        }
        pawn.area = this;
        pawn.setCoord(dummy.coord);
        pawn.changeRotation();
        this.pawns.push(pawn);
    }

    remove(pawn: Pawn) {
        const index = this.pawns.indexOf(pawn);
        if(index !== -1) {
            this.pawns.splice(index, 1);
            pawn.area = null;
            pawn.coord = null;
        }
    }

    clear() {
        while(this.pawns.length)
            this.remove(this.pawns[0]);
    }
}
