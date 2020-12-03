class Egg {
    constructor(ctx) {
        this.count = 0;
        this.ctx = ctx;
    }

    increment() {
        this.count++;
        if (this.count == 10) {
            board.timer.stop();
            board.inactive = true;
            new Message(this.ctx, "egg");
        }
    }
}