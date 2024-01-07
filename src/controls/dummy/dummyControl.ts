import {Point} from "../../shared/point.ts";
import {Control} from "../control.ts";

export class DummyControl implements Control {
    id: string;
    position: Point;
    selected: boolean = false

    public constructor() {
        this.id = 'dummy'
        this.position = Point.zero()
    }

    clone(): Control {
        return new DummyControl();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        console.log(`dummy draw on ${ctx}`)
    }

    // @ts-ignore
    hitTest(point: Point): boolean {
        return false;
    }
}
