class Keypad {
    constructor(ctx, origX, origY, cellSize) {
        this.ctx = ctx;

        this.origX = origX + cellSize * 3.5;
        this.origY = origY + cellSize * 10;
        this.cellSize = cellSize;

        this.selectedKey = -1;
        this.selectedNote = false;
    }

    getNumber(x, y) {
        //returns which value was selected
        y -= this.origY;
        x -= this.numbers[0][0];
        let col = Math.floor(x / this.cellSize);
        let row = Math.round(y / this.cellSize);
        if (row > 5 || col > 1 || row < 0 || col < 0) {
            return -1;
        }
        let num = row + col * 5;
        if (num <= 0 || num > 10) {
            return -1;
        }
        if (num == 10) {
            num = 0;
        }
        return num;
    }

    getClickedNumber(x, y, stayHighlighted) {
        let relative_x = x - this.origX + this.cellSize / 2;
        let relative_y = y - this.origY + this.cellSize / 2;
        let col = Math.floor(relative_x / this.cellSize);
        let row = Math.floor(relative_y / this.cellSize);

        if (!stayHighlighted && !(row == 3 && col == 1)) {
            this.selectKey(-1);
        }

        if (col >= 0 && col <= 2) {
            if (row >= 0 && row <= 2) {
                // clicked on number
                if (stayHighlighted) {
                    this.selectKey(row * 3 + col);
                }
                return row * 3 + col + 1;
            } else {
                if (row == 3 && col == 0) {
                    // clicked on note button
                    this.selectKey(9);
                } else if (row == 3 && col == 1) {
                    // clicked on clear button
                    if (stayHighlighted) {
                        this.selectedNote = false;
                        this.selectKey(10);
                    }
                    return 0;
                }
            }
        }
        return -1; // not clicked on number
    }

    selectKey(key) {
        if (this.selectedKey == key) {
            key = -1;
        }
        if (key == 9) {
            this.selectedNote = !this.selectedNote;
        } else {
            this.selectedKey = key;
        }
        this.draw();
    }

    draw() {
        this.ctx.clearRect(this.origX - this.cellSize / 2 - 3, this.origY - this.cellSize / 2 - 3, this.cellSize * 3 + 6, this.cellSize * 4 + 6);

        this.ctx.fillStyle = "rgba(0,0,0,0.05)";
        this.ctx.fillRect(this.origX - this.cellSize / 2, this.origY - this.cellSize / 2, this.cellSize * 3, this.cellSize * 3);
        this.ctx.fillRect(this.origX - this.cellSize / 2, this.origY + this.cellSize * 2.5, this.cellSize * 2, this.cellSize);
        for (let i = 0; i < 4; i++) {
            line(this.ctx, this.origX + this.cellSize * (i - 0.5), this.origY - this.cellSize / 2, this.origX + this.cellSize * (i - 0.5), this.origY + this.cellSize * 2.5, i);
        }
        for (let j = 0; j < 3; j++) {
            line(this.ctx, this.origX - this.cellSize / 2, this.origY + this.cellSize * (j - 0.5), this.origX + this.cellSize * 2.5, this.origY + this.cellSize * (j - 0.5), j);
        }

        if (this.selectedKey != -1) {
            let col = this.selectedKey % 3;
            let row = (this.selectedKey - col) / 3;
            this.ctx.fillStyle = "rgba(0,0,0,0.3)";
            this.ctx.fillRect(this.origX - this.cellSize / 2 + this.cellSize * col, this.origY - this.cellSize / 2 + this.cellSize * row, this.cellSize, this.cellSize);
        }
        if (this.selectedNote) {
            this.ctx.fillStyle = "rgba(0,0,0,0.3)";
            this.ctx.fillRect(this.origX - this.cellSize / 2, this.origY - this.cellSize / 2 + this.cellSize * 3, this.cellSize, this.cellSize);
        }
        this.ctx.fillStyle = "black";

        // horizontal lines row 3
        line(this.ctx, this.origX - this.cellSize / 2, this.origY + this.cellSize * 2.5, this.origX + this.cellSize / 2, this.origY + this.cellSize * 2.5, 1);
        line(this.ctx, this.origX + this.cellSize / 2, this.origY + this.cellSize * 2.5, this.origX + this.cellSize * 1.5, this.origY + this.cellSize * 2.5, 1);
        line(this.ctx, this.origX + this.cellSize * 1.5, this.origY + this.cellSize * 2.5, this.origX + this.cellSize * 2.5, this.origY + this.cellSize * 2.5, 0);


        // vertical lines row 3
        line(this.ctx, this.origX - this.cellSize / 2, this.origY + this.cellSize * 2.5, this.origX - this.cellSize / 2, this.origY + this.cellSize * 3.5, 0);
        line(this.ctx, this.origX + this.cellSize / 2, this.origY + this.cellSize * 2.5, this.origX + this.cellSize / 2, this.origY + this.cellSize * 3.5, 1);
        line(this.ctx, this.origX + this.cellSize * 1.5, this.origY + this.cellSize * 2.5, this.origX + this.cellSize * 1.5, this.origY + this.cellSize * 3.5, 0);

        // bottom border
        line(this.ctx, this.origX - this.cellSize / 2, this.origY + this.cellSize * 3.5, this.origX + this.cellSize * 1.5, this.origY + this.cellSize * 3.5, 0);

        for (let i = 0; i < 9; i++) {
            let column = i % 3;
            let row = Math.floor((i - column) / 3);
            draw_text(this.ctx, i + 1, this.origX + column * this.cellSize, this.origY + row * this.cellSize);
        }
        draw_text(this.ctx, "C", this.origX + this.cellSize, this.origY + 3 * this.cellSize);
        draw_text(this.ctx, "N", this.origX, this.origY + 3 * this.cellSize);
    }

    getNumber(x, y) {
        //returns which value was selected
        y -= this.origY;
        x -= this.numbers[0][0];
        let col = Math.floor(x / this.cellSize);
        let row = Math.round(y / this.cellSize);
        if (row > 5 || col > 1 || row < 0 || col < 0) {
            return -1;
        }
        let num = row + col * 5;
        if (num <= 0 || num > 10) {
            return -1;
        }
        if (num == 10) {
            num = 0;
        }
        return num;
    }
}
