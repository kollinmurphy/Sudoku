class Message {
    constructor(ctx, msg) {
        this.ctx = ctx;

        const BTN_HOME = "<button type='submit' class='btn btn-secondary' id='btnHome'>Home</button>";
        const BTN_TRY_AGAIN = "<button class='btn btn-secondary' id='btnTryAgain'>Try Again</button>"

        switch (msg) {
            case "won":
                this.text = ["Congratulations!", "You won!"];
                new Fireworks(this.ctx.canvas.width, this.ctx.canvas.height);
                $("#divButtons").html(BTN_HOME);
                break;
            case "incorrect":
                this.text = ["Uh oh!", "Looks like you", "made a mistake."];
                $("#divButtons").html(BTN_TRY_AGAIN + BTN_HOME);
                $("#btnTryAgain").bind('touchend', function() {
                    board.clearMessage();
                    $("#divButtons").html(BTN_HOME);
                });
                break;
            case "egg":
                this.text = ["Game by:", "Canyon Bryson", "Kollin Murphy"];
                $("#divButtons").html(BTN_TRY_AGAIN + BTN_HOME);
                $("#btnTryAgain").html("Keep Playing");
                $("#btnTryAgain").bind('touchend', function() {
                    board.clearMessage();
                    $("#divButtons").html(BTN_HOME);
                });

        }
        this.draw();
    }

    draw() {
        set_font(this.ctx, 36);
        this.ctx.fillStyle = "rgba(0,0,0,0.8)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "white";
        let x_mid = this.ctx.canvas.width / 2;
        let y_start = 124;
        let line_height = 36;
        for (let i = 0; i < this.text.length; i++) {
            this.ctx.fillText(this.text[i], x_mid, y_start + i * line_height);
        }

    }
}