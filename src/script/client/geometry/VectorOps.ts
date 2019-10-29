import {Point} from "./Point";


export function add(...vectors: Array<Point>): Point {
    return vectors.reduce((a, b) => new Point(a.x+b.x, a.y+b.y));
}

export function sub(v1: Point, v2: Point) {
    return new Point(v1.x-v2.x, v1.y-v2.y);
}

export function norm(v: Point) {
    return Math.hypot(v.x, v.y);
}

export function dot(a: Point, b: Point) {
    return a.x*b.x + a.y*b.y;
}
