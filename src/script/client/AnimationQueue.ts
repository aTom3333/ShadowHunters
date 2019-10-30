


export interface Animation {
    execute(): Promise<void>
}

export class AnimationQueue {
    queue: Array<Animation>;
    working: boolean;

    constructor() {
        this.queue = [];
        this.working = false;
    }

    add(work: Animation) {
        this.queue.push(work);
        if(!this.working)
            this.doWork();
    }

    private async doWork() {
        this.working = true;
        while(this.queue.length > 0) {
            const current = this.queue[0];
            this.queue.splice(0, 1);
            await current.execute();
        }
        this.working = false;
    }
}
