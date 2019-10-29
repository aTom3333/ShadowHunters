import {Quadgon} from "./geometry/Quadgon";
import {Point, PointLike} from "./geometry/Point";
import {norm, sub} from "./geometry/VectorOps";
import {PawnColor} from "../common/Game/CharacterState";


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
    }
}

export class Pawn {
    coord: Point;
    color: PawnColor;

    constructor(coord: Point, color: PawnColor) {
        this.coord = coord;
        this.color = color;
    }

    collidesWith(other: Pawn) {
        return norm(sub(other.coord, this.coord)) < 5; // TODO Set correct value
    }
}

export class PawnArea {
    private area: Quadgon;
    pawns: Array<Pawn>;

    constructor(points: Array<PointLike>) {
        this.area = new Quadgon(points.map(p => Point.fromPointLIke(p)))
        this.pawns = [];
    }

    add(color: PawnColor) {
        const maxTries = 10;
        for(let i = 0; i < maxTries; i++) {
            const newPawn = new Pawn(this.area.randomPointInside(), color);
            if(!this.pawns.map(p => p.collidesWith(newPawn)).reduce((a,b) => a||b, false)) {
                this.pawns.push(newPawn);
                return;
            }
        }
        this.pawns.push(new Pawn(this.area.randomPointInside(), color));
    }

    remove(color: PawnColor) {
        const index = this.pawns.findIndex(p => p.color == color);
        if(index !== -1)
            this.pawns.splice(index, 1);
    }

    clear() {
        this.pawns = [];
    }
}
