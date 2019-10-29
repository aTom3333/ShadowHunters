

export interface PointLike {
    x: number;
    y: number;
}

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromPointLIke(pl: PointLike) {
        return new Point(pl.x, pl.y);
    }
}
