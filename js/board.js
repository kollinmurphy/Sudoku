
class Board {
    constructor(difficulty, ctx) {
        this.highlightedCell = [-1, -1];
        this.ctx = ctx;
        this.difficulty = difficulty;
        this.data = [];
        this.cellSize = Math.floor(Math.min(this.ctx[0].canvas.width - 18, this.ctx[0].canvas.height - 18) / 9);
        this.origX = Math.floor(this.ctx[0].canvas.width / 2 - this.cellSize * 4.5);
        this.origY = 9;
        this.keypad = new Keypad(this.ctx[0], this.origX, this.origY, this.cellSize);
        this.generate();
        this.draw();
        this.timer = new Timer(ctx[2]);

        this.inactive = false;
    }

    generate() {
        this.gridNotes = [];
        for (let i = 0; i < 9; i++) { // initialize empty 9x9 grid
            this.data.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            this.gridNotes.push([[], [], [], [], [], [], [], [], []]);
        }

        this.randomizeGroup(this.data, 1);
        this.randomizeGroup(this.data, 5);
        this.randomizeGroup(this.data, 9);

        let cellsRemoved = 0;
        let gridParameters = { minToRemove: 36, maxToRemove: 42, maxAttempts: 50 };
        switch (this.difficulty) {
            case 1:
                gridParameters = { minToRemove: 36, maxToRemove: 42, maxAttempts: 50 };
                break;
            case 2:
                gridParameters = { minToRemove: 41, maxToRemove: 46, maxAttempts: 100 };
                break;
            case 3:
                gridParameters = { minToRemove: 47, maxToRemove: 64, maxAttempts: 150 };
        }

        while (cellsRemoved < gridParameters.minToRemove) {
            console.log("start");
            this.gridSolution = this.createBoard(this.data); // recursively solve board
            let gridPrompt = { cellsRemoved: 0 }; // recursively remove numbers from board

            for (let i = 0; i < 3; i++) {
                let newPossibility = this.removeCells(this.gridSolution, gridParameters);
                console.log(newPossibility.cellsRemoved);
                if (newPossibility.cellsRemoved > gridPrompt.cellsRemoved) {
                    gridPrompt = newPossibility;
                    cellsRemoved = gridPrompt.cellsRemoved;
                }
                if (cellsRemoved >= gridParameters.minToRemove) {
                    break;
                }
            }

            this.gridPrompt = gridPrompt.data;
            this.gridCurrent = this.cloneArray(this.gridPrompt);
        }

        $("#loading").hide();
    }

    createBoard(data) {
        return this.fillCell(data).data; // call recursive function
    }

    fillCell(data) {
        // duplicate data array
        let tempData = this.cloneArray(data);

        // find next empty cell
        // if no empty cells, return data
        let empty = [-1, -1];
        for (let i = 0; i < tempData.length; i++) {
            for (let j = 0; j < tempData[i].length; j++) {
                if (tempData[i][j] == 0) {
                    empty = [i, j];
                    i = 10; // get out of both for loops
                    break;
                }
            }
        }
        if (empty[0] == -1 && empty[1] == -1) { // if all cells are filled, return the result
            return {
                data: tempData,
                result: true
            };
        }

        // initalize empty safe array
        let safe = this.findSafeNumbers(tempData, empty[0], empty[1]);

        while (safe.length > 0) { // loop through all safe numbers
            let index = 0;
            let numToCheck = safe.splice(index, 1)[0];
            tempData[empty[0]][empty[1]] = numToCheck; // set found empty cell to the first/last safe number
            let result = this.fillCell(tempData); // recursively call to fill next cell
            if (result.result) { // if returned successfully, return the new array
                return {
                    data: result.data,
                    result: true
                };
            }
        }

        // failed to find a valid solution
        // should never get to this point
        return {
            data: tempData,
            result: false
        };

    }

    removeCells(data, gridParameters) {
        return this.removeCell(data, gridParameters, 0, 0);
    }

    removeCell(data, gridParameters, attempts, removed) {
        if (attempts > gridParameters.maxAttempts || removed >= gridParameters.maxToRemove) {
            return {
                data: data,
                cellsRemoved: removed
            };
        }

        let tempData = this.cloneArray(data);
        let isZero = true;
        let row = -1;
        let col = -1;
        while (isZero) { // find a random filled cell
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
            if (tempData[row][col] != 0) {
                isZero = false;
            }
        }
        tempData[row][col] = 0; // clear cell

        attempts++;
        let result = this.isNewSolution(tempData);
        if (!result.result) { // if is a unique solution
            removed++;
            return this.removeCell(tempData, gridParameters, attempts, removed);
        } else {
            return this.removeCell(data, gridParameters, attempts, removed);
        }
    }

    isNewSolution(data) {
        let tempData = this.cloneArray(data);
        let emptyCells = [];
        for (let i = 0; i < tempData.length; i++) {
            for (let j = 0; j < tempData[i].length; j++) {
                if (tempData[i][j] == 0) {
                    emptyCells.push([i, j]);
                }
            }
        }
        if (emptyCells.length == 0) { // if all cells are filled, return the result
            return {
                data: tempData,
                result: true
            };
        }
        for (let i = 0; i < emptyCells.length; i++) {
            // fill it with every safe solution
            let empty = emptyCells[i];
            let safe = this.findSafeNumbers(tempData, empty[0], empty[1]);
            while (safe.length > 0) {
                let index = 0;
                let numToCheck = safe.splice(index, 1)[0];
                tempData[empty[0]][empty[1]] = numToCheck; // set found empty cell to the first/last safe number
                let result = this.fillCell(tempData); // recursively call to fill next cell

                //if returns same solution then good. else return { result: true }
                if (!this.compareArray(result.data, this.gridSolution)) {
                    return { result: true };
                }
            }
        }
        return { result: false };
    }

    cloneArray(array) {
        return JSON.parse(JSON.stringify(array));
    }

    compareArray(array1, array2) {
        return (JSON.stringify(array1) == JSON.stringify(array2));
    }

    shuffle(array) {
        for (let i = 0; i < array.length; i++) {
            let j = Math.floor(Math.random() * i);
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    randomizeGroup(data, group) {
        let list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffle(list);
        for (let i = 0; i < 3; i++) {
            let g = Math.floor((group - 1) / 3) * 3; //Start at row 0, 3, 6
            data[g + i][g] = list[i];
            data[g + i][g + 1] = list[i + 3];
            data[g + i][g + 2] = list[i + 6];
        }
    }

    isValid(data) {
        const COMPLETE = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        const BLANK = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < data.length; i++) { // check if all rows & columns are valid
            let row = this.cloneArray(BLANK);
            let col = this.cloneArray(BLANK);
            for (let j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0)
                    row[data[i][j] - 1] += 1;
                if (data[j][i] != 0)
                    col[data[j][i] - 1] += 1;
            }
            if (!this.compareArray(COMPLETE, row) || !this.compareArray(COMPLETE, col)) {
                return false;
            }
        }

        for (let i = 0; i < 3; i++) { // check if all groups are valid
            for (let j = 0; j < 3; j++) {
                let box = this.cloneArray(BLANK);
                for (let ii = 0; ii < 3; ii++) {
                    for (let jj = 0; jj < 3; jj++) {
                        box[data[i * 3 + ii][j * 3 + jj] - 1] += 1;
                    }
                }
                if (!this.compareArray(COMPLETE, box)) {
                    return false;
                }
            }
        }

        return true;
    }

    findSafeNumbers(grid, row, col, ignore = -1) {
        let index = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (ignore != -1) { // ignore former content of cell
            index[ignore - 1] = 1;
        }

        let numbers = this.cloneArray(grid[row]); // get numbers in row

        for (let i = 0; i < 9; i++) { // get numbers in column
            numbers.push(grid[i][col]);
        }

        // get numbers in group
        let groupStartCol = Math.floor(col / 3) * 3;
        let groupStartRow = Math.floor(row / 3) * 3;
        for (let i = groupStartRow; i < groupStartRow + 3; i++) {
            for (let j = groupStartCol; j < groupStartCol + 3; j++) {
                numbers.push(grid[i][j]);
            }
        }

        // count numbers and save in index
        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] != 0) {
                index[numbers[i] - 1]++;
            }
        }

        // find all indices that are zero and append to safeNums array
        let safeNums = [];
        for (let i = 0; i < index.length; i++) {
            if (index[i] == 0) {
                safeNums.push(i + 1);
            }
        }
        return safeNums;
    }

    draw() {
        this.ctx[0].clearRect(0, 0, this.ctx[0].canvas.width, this.ctx[0].canvas.height);
        for (let i = 0; i < 10; i++) {
            line(this.ctx[0], this.origX + this.cellSize * i, this.origY, this.origX + this.cellSize * i, this.origY + this.cellSize * 9, i);
        }
        for (let j = 0; j < 10; j++) {
            line(this.ctx[0], this.origX, this.origY + this.cellSize * j, this.origX + this.cellSize * 9, this.origY + this.cellSize * j, j);
        }
        set_font(this.ctx[0], this.cellSize);
        for (let i = 0; i < this.gridCurrent.length; i++) {
            for (let j = 0; j < this.gridCurrent[i].length; j++) {
                if (this.gridCurrent[j][i] != 0) {
                    if (this.gridPrompt[j][i] != 0) {
                        this.ctx[0].fillStyle = "rgba(0,0,0,0.2)";
                        this.ctx[0].fillRect(this.origX + this.cellSize * i, this.origY + this.cellSize * j, this.cellSize, this.cellSize);
                    }
                    this.ctx[0].fillStyle = "black";
                    draw_text(this.ctx[0], this.gridCurrent[j][i], this.origX + this.cellSize * i + this.cellSize * 0.5, this.origY + this.cellSize * j + this.cellSize * 0.5);
                } else if (this.gridNotes[j][i].length != 0) {
                    set_font_small(this.ctx[0], this.cellSize);
                    for (let k = 0; k < this.gridNotes[j][i].length; k++) {
                        let col = (this.gridNotes[j][i][k] - 1) % 3 + 0.4;
                        let row = (this.gridNotes[j][i][k] - col - 1) / 3 + 0.1;
                        draw_text(this.ctx[0], this.gridNotes[j][i][k], this.origX + this.cellSize * i + (col * this.cellSize * 0.3), this.origY + this.cellSize * j + (row * this.cellSize * 0.3));
                    }
                    set_font(this.ctx[0], this.cellSize);
                }   
            }
        }
        // this.setCells(this.gridCurrent, this.origX, this.origY, this.cellSize);
        this.keypad.draw(this.ctx[0]);
    }

    clickedBoard(x, y) {
        let xx = x - this.origX;
        let yy = y - this.origY;
        return (xx >= 0 && xx <= this.cellSize * 9) && (yy >= 0 && yy <= this.cellSize * 9);
    }

    getClickedCell(x, y) {
        // returns the cell with x, y coords
        x -= this.origX;
        y -= this.origY;
        let col = Math.floor(x / this.cellSize);
        let row = Math.floor(y / this.cellSize);
        return [col, row];
    }

    highlightCell(cellCoords, outline = true) {
        if (outline) {
            this.highlightedCell = cellCoords;
        }

        if (cellCoords[0] != -1) {
            let cell_x = this.origX + cellCoords[0] * this.cellSize;
            let cell_y = this.origY + cellCoords[1] * this.cellSize;

            let drawGradient = !outline;
            if (outline) {
                this.draw(); // clear canvas and redraw board if selecting new cell
                line(this.ctx[0], cell_x, cell_y, cell_x + this.cellSize, cell_y, -1);
                line(this.ctx[0], cell_x, cell_y, cell_x, cell_y + this.cellSize, -1);
                line(this.ctx[0], cell_x + this.cellSize, cell_y, cell_x + this.cellSize, cell_y + this.cellSize, -1);
                line(this.ctx[0], cell_x, cell_y + this.cellSize, cell_x + this.cellSize, cell_y + this.cellSize, -1);
                if (this.gridCurrent[cellCoords[1]][cellCoords[0]] != 0) {
                    this.highlightAllOfNumber(this.gridCurrent[cellCoords[1]][cellCoords[0]]);
                } else {
                    drawGradient = true;
                }
            }
            if (drawGradient) {
                var grd = this.ctx[0].createRadialGradient(cell_x + this.cellSize / 2, cell_y + this.cellSize / 2, 10, cell_x + this.cellSize / 2, cell_y + this.cellSize / 2, this.cellSize);
                grd.addColorStop(0, "rgba(0,62,214,0.09)");
                grd.addColorStop(1, "rgba(0,151,255,0.8)");
                this.ctx[0].fillStyle = grd;
                this.ctx[0].fillRect(cell_x, cell_y, this.cellSize, this.cellSize);
            }
        } else {
            this.draw(); // clear canvas and redraw board if selecting new cell
        }
    }

    highlightAllOfNumber(num) {
        for (let i = 0; i < this.gridCurrent.length; i++) {
            for (let j = 0; j < this.gridCurrent.length; j++) {
                if (this.gridCurrent[i][j] == num) {
                    this.highlightCell([j, i], false);
                }
            }
        }
    }

    isFull(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].includes(0)) {
                return false;
            }
        }
        return true;
    }

    updateCell(num) {
        if (!this.compareArray(this.highlightedCell, [-1, -1])) { // if there is a cell selected
            if (this.gridPrompt[this.highlightedCell[1]][this.highlightedCell[0]] == 0) {
                //updates a cell with the desired number
                if (num == 0 && this.gridCurrent[this.highlightedCell[1]][this.highlightedCell[0]] == 0) {
                    // if clearing, clear the notes only if the cell is currently empty
                    this.gridNotes[this.highlightedCell[1]][this.highlightedCell[0]] = [];
                }
                this.gridCurrent[this.highlightedCell[1]][this.highlightedCell[0]] = num;
                this.highlightCell(this.highlightedCell);
            }
            this.checkComplete();
        }
    }

    updateNote(num) {
        if (!this.compareArray(this.highlightedCell, [-1, -1])) { // if there is a cell selected
            if (this.gridPrompt[this.highlightedCell[1]][this.highlightedCell[0]] == 0) {
                //updates a cell with the desired number
                this.gridNotes[this.highlightedCell[1]][this.highlightedCell[0]].push(num);
                this.gridNotes[this.highlightedCell[1]][this.highlightedCell[0]] = this.removeNoteDuplicates(this.gridNotes[this.highlightedCell[1]][this.highlightedCell[0]]);
                // this.highlightCell([-1, -1]);
                this.highlightCell(this.highlightedCell);
                this.highlightAllOfNumber(num);
            }
        }
    }

    checkComplete() {
        if (this.isFull(this.gridCurrent)) {
            this.timer.stop();
            this.inactive = true;
            if (this.isValid(this.gridCurrent)) {
                // won!
                new Message(this.ctx[2], "won");
            } else {
                // bad
                new Message(this.ctx[2], "incorrect");
            }
        }
    }

    clearMessage() {
        this.ctx[2].clearRect(0, 0, this.ctx[2].canvas.width, this.ctx[2].canvas.height);
        this.timer.start();
        this.inactive = false;
    }

    removeNoteDuplicates(array) {
        let idx = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let newArray = [];
        for (let i = 0; i < array.length; i++) {
            if (idx[array[i] - 1] == 0) {
                idx[array[i] - 1] = 1;
                newArray.push(array[i]);
            }
        }
        return newArray;
    }
}

