import {Point} from "./Point";
import {add, sub} from "./VectorOps";
import {random} from "../Utilities";


export class Quadgon {
    // Points must be in direct direction
    points: Array<Point>;

    constructor(points: Array<Point>) {
        this.points = points;
    }

    isInside(C: Point): boolean {
        // Point is inside if it is on the left of every side
        for(let i = 0; i < this.points.length; i++) {
            const A = this.points[i];
            const B = this.points[(i+1)%this.points.length];

            const AB = sub(B, A);
            const AC = sub(C, A);

            // z component of vectorial product of AB and AC
            const value = AB.x*AC.y - AB.y*AC.x;

            if(value < 0)
                return false;
        }
        return true;
    }

    randomPointInside(): Point {
        const maxTries = 10;
        const min = this.points.reduce((a, b) => new Point(Math.min(a.x, b.x), Math.min(a.y, b.y)));
        const max = this.points.reduce((a, b) => new Point(Math.max(a.x, b.x), Math.max(a.y, b.y)));
        // Try generating a random point
        for(let i = 0; i < maxTries; i++) {
            const p = new Point(random(min.x, max.x), random(min.y, max.y));
            if(this.isInside(p))
                return p;
        }
        // Fall back to returning the barycenter
        const acc = add(...this.points);
        return new Point(acc.x / this.points.length, acc.y / this.points.length);
    }
}
