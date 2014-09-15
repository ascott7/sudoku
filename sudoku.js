angular.module('sudokuApp', ['sudokuApp.sudokuController']);

angular.module('sudokuApp.sudokuController', []).controller('sudokuAppCtrl', function($scope) {
    var tempBoard = new Board([]);
    $scope.board = tempBoard.getBoard();
    $scope.solved = false;
    $scope.solvePuzzle = function() {
        var solve = new Solver($scope.board, true);
        solve.solve();
        if (solve.board.boardSolved){
            $scope.board = solve.board.getBoard();
            $scope.solved = true;
        }
    }
});

function Board (theBoard) {
    this.board = theBoard;
    if(this.board.length === 0) {
        this.board = [];
        for (var i = 0; i < 9; ++ i) {
            this.board[i] = new Array(9);
        }
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < 9; ++j) {
                this.board[i][j] = 0;
            }
        };
    }

    this.copyBoard = function(boardToCopy) {
        var board = [];
        for (var i = 0; i < 9; ++ i) {
            board[i] = new Array(9);
        }
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < 9; ++j) {
                board[i][j] = boardToCopy[i][j];
            }
        };
        return board;
    }

    this.getBoard = function() {
        return this.copyBoard(this.board);
    }

    this.setNum = function(x, y, num) {
        this.board[x][y] = num;
    }

    this.getNum = function(x, y) {
        return this.board[x][y];
    }

    this.boardNotSolvable = function() {
        return !this.boardLegal();
    }

    this.boardLegal = function() {
        return this.rowsLegal() && this.columnsLegal() && this.squaresLegal();
    }

    this.rowsLegal = function() {
        for (var j = 0; j < 9; ++j) {
            var rowNums = [];
            for (var i = 0; i < 9; ++i) {
                if (this.board[i][j] != 0) {
                    rowNums.push(this.board[i][j]);
                }
            }
            if (this.hasRepeats(rowNums)) {
                return false;
            }
        }
        return true;
    }

    this.columnsLegal = function() {
        for (var i = 0; i < 9; ++i) {
            var colNums = [];
            for (var j = 0; j < 9; ++j) {
                if (this.board[i][j] != 0) {
                    colNums.push(this.board[i][j]);
                }
            }
            if (this.hasRepeats(colNums)) {
                return false;
            }
        }
        return true;
    }

    this.squaresLegal = function() {
        for (var i = 0; i < 9; i+=3) {
            for (var j = 0; j < 9; j+=3) {
                squareNums = [];
                for (var k = 0; k < 3; ++k) {
                    for (var m = 0; m < 3; ++m) {
                        if (this.board[i + k][j + m] != 0) {
                            squareNums.push(this.board[i + k][j + m]);
                        }
                    }
                }
                if (this.hasRepeats(squareNums)) {
                    return false;
                }
            };
        };
        return true;
    }

    this.hasRepeats = function(nums) {
        for (var i = 0; i < nums.length; i++) {
            for (var j = i + 1; j < nums.length; j++) {
                if (nums[i] === nums[j]) {
                    return true;
                }
            };
        };
    return false;
    }

    this.boardSolved = function() {
        for (var i = 0; i < 9; ++i) {
            for (var j = 0; j < 9; ++j) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    this.numsInRow = function(y) {
        var nums = [];
        for (var i = 0; i < 9; ++i) {
            if (this.board[i][y] != 0) {
                nums.push(this.board[i][y]);
            }
        }
        return nums;
    }

    this.numsInColumn = function(x) {
        var nums = [];
        for (var j = 0; j < 9; ++j) {
            if (this.board[x][j] != 0) {
                nums.push(this.board[x][j]);
            }
        }
        return nums;
    }

    this.numsInSquare = function(x, y) {
        var nums = [];
        var tempX = Math.floor(x / 3) * 3;
        var tempY = Math.floor(y / 3) * 3;
        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 3; ++j) {
                var temp = this.board[tempX + i][tempY + j];
                if (temp != 0) {
                    nums.push(temp);
                }
            }
        }
        return nums;
    }

    this.printBoard = function() {
        for (var j = 0; j < 9; ++j) {
            console.log(this.board[j]);
        }
    }
}

function Options () {
    this.choices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.solved = false;

    this.eliminateChoices = function(choicesToRemove) {
        var progressMade = false;
        for (var i = 0; i < choicesToRemove.length; ++i) {
            if (this.contains(choicesToRemove[i], this.choices)) {
                var index = this.choices.indexOf(choicesToRemove[i]);
                this.choices.splice(index, 1);
                progressMade = true;
            }
        }
        return progressMade;
    }

    this.contains = function(num, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === num) {
                return true;
            }
        };
        return false;
    }

    this.getChoices = function() {
        return this.choices;
    }

    this.isSolved = function() {
        return this.solved;
    }

    this.setChoice = function(choice) {
        this.choices = [choice];
        // this.solved = true;
    }

    this.numChoices = function() {
        return this.choices.length;
    }

    this.checkSolved = function() {
        if (this.numChoices() === 1) {
            this.solved = true;
            return this.choices[0];
        } else {
            return 0;
        }
    }
}

function Solver (theBoard, debugMode) {
    this.board = new Board(theBoard);
    this.allChoices = [];
    for (var i = 0; i < 9; ++i) {
        this.allChoices[i] = new Array(9);
    }
    for (var i = 0; i < 9; ++i) {
        for(var j = 0; j < 9; ++ j) {
            this.allChoices[i][j] = new Options();
        }
    }
    this.debug = debugMode;

    this.solve = function() {
        while (!this.board.boardSolved()) {
            // If the board is not solvable, we are done
            if (this.board.boardNotSolvable()) {
                if (this.debug){
                    console.log("Not solvable");
                }
                break;
            }
           // If we can't eliminate any options...
            if (!this.tryToMakeProgress()) {
                if(this.debug) {
                    console.log("making guess");
                }
                // Try guessing. If none of the guesses are right, the board
                // is not solvable
                if (!this.makeGuess()) {
                    break;
                }
            }
            if (this.debug) {
                this.printBoard();
            }
        }
    }

    this.tryToMakeProgress = function() {
        var progress = false;
        for (var i = 0; i < 9; ++i) {
            for (var j = 0; j < 9; ++j) {
                if(this.maybeReduceOptions(i, j)) {
                    progress = true;
                }
            }
        }
        progress = this.checkSingleOptions() || progress;
        this.updateBoard();
        return progress;
    }

    this.maybeReduceOptions = function(x, y) {
        var tempSquare = this.allChoices[x][y];

        if (tempSquare.isSolved()) {
            return false;
        }

        if (tempSquare.numChoices() === 1) {
            this.board.setNum(x, y, tempSquare.checkSolved());
        }

        // if the square is already solved, mark it as so in the choice array
        if (this.board.getNum(x, y) != 0) {
            tempSquare.setChoice(this.board.getNum(x, y));
            tempSquare.solved = true;
            if (this.debug) {
                console.log("square solved");
            }
            return true;
        }

        else {
            var progressMade = false;
            // Eliminate any numbers in the square's row
            if (tempSquare.eliminateChoices(this.board.numsInRow(y))) {
                progressMade = true;
                if (this.debug) {
                    console.log("eliminated row nums");
                }
            }
            // Eliminate any numbers in the square's column
            if (tempSquare.eliminateChoices(this.board.numsInColumn(x))) {
                progressMade = true;
                if (this.debug) {
                    console.log("eliminated column nums");
                }
            }
            // Eliminates any numbers in the square's big square
            if (tempSquare.eliminateChoices(this.board.numsInSquare(x, y))) {
                progressMade = true;
                if (this.debug) {
                    console.log("eliminated square nums");
                }
            }
            return progressMade;
        }
    }

    this.checkSingleOptions = function() {
        var progressMade = false;
        for (var i = 0; i < 9; ++i) {
            // check rows
            if (this.oneOptionInRow(i)) {
                if (this.debug) {
                    console.log("found one option in row");
                }
                progressMade = true;
            }
            // check columns
            if (this.oneOptionInColumn(i)) {
                if (this.debug) {
                    console.log("found one option in column");
                }
                progressMade = true;
            }
        }
        for (var i = 0; i < 9; i+=3) {
            for (var j = 0; j < 9; j+=3) {
                if (this.oneOptionInSquare(i, j)) {
                    if (this.debug) {
                        console.log("found one option in square");
                    }
                    progressMade = true;
                }
            }
        }
        return progressMade;
    }

    this.printChoices = function() {
        for (var j = 0; j < 9; ++j) {
            for (var i = 0; i < 9; ++i) {
                console.log(this.allChoices[i][j].choices);
            }
        }
    }

    this.updateBoard = function() {
        for (var i = 0; i < 9; ++i) {
            for (var j = 0; j < 9; ++j) {
                this.board.setNum(i, j, this.allChoices[i][j].checkSolved());
            }
        }
    }

    this.makeGuess = function() {
        var hasSolution = false;
        for (var i = 0; i < 9; ++i) {
            for (var j = 0; j < 9; ++j) {
                var guessSquare = this.allChoices[i][j];
                if (guessSquare.getChoices().length === this.shortestChoice()) {
                    var tempSingleChoices = guessSquare.getChoices();
                    // loop through the choices guessing them
                    for (var k = 0; k < tempSingleChoices.length; ++k) {
                        guessNum = tempSingleChoices[k];
                        if (this.debug) {
                            console.log("guessing " + guessNum + " at (" + i + ", " + j, ")");
                        }
                        var tempBoard = new Board(this.board.getBoard());
                        tempBoard.setNum(i, j, guessNum);
                        // make the guess
                        guess = new Solver(tempBoard.getBoard(), this.debug);
                        guess.solve();
                        // if the guess was correct, we are done
                        if (guess.board.boardSolved()) {
                            this.board = new Board(guess.board.getBoard());
                            hasSolution = true;
                            break;
                        }
                    }
                    return hasSolution;
                }
            }
        }
    }

    this.copyBoard = function(boardToCopy) {
        board = [];
        for (var i = 0; i < 9; ++ i) {
            board[i] = new Array(9);
        }
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < 9; ++j) {
                board[i][j] = boardToCopy[i][j];
            }
        };
        return new Board(board, boardToCopy.debug);
    }

    // need a separate copy function to also copy over the board functions

    this.shortestChoice = function() {
        var shortest = 9;
        for (var i = 0; i < 9; ++i) {
            for (var j = 0; j < 9; ++j) {
                var curLength = this.allChoices[i][j].numChoices();
                if (curLength < shortest && curLength != 1) {
                    shortest = curLength;
                }
                if (shortest == 2) {
                    return shortest;
                }
            }
        }
        return shortest;
    }

    this.countNumInArray = function(num, array) {
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i] === num) {
                count++;
            }
        };
        return count;
    }

    this.contains = function(num, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === num) {
                return true;
            }
        };
        return false;
    }

    this.oneOptionInRow  = function(y) {
        var picks = [];
        for (var i = 0; i < 9; ++i) {
            var tempSquare = this.allChoices[i][y];
            if (!tempSquare.isSolved()) {
                for (var c = 0; c < tempSquare.choices.length; ++c) {
                    picks.push(tempSquare.choices[c]);
                }
            }
        }
        var solvedNum = 0;
        for (var i = 0; i < picks.length; ++i) {
            var tempNum = picks[i];
            // if there is only one square that can take this number
            if (this.countNumInArray(tempNum, picks) === 1) {
                solvedNum = tempNum;
                for (var k = 0; k < 9; ++k) {
                    var tempSquare = this.allChoices[k][y];
                    if (this.contains(solvedNum, tempSquare.getChoices())) {
                        tempSquare.setChoice(solvedNum);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    this.oneOptionInColumn = function(x) {
        var picks = [];
        for (var i = 0; i < 9; ++i) {
            var tempSquare = this.allChoices[x][i];
            if (!tempSquare.isSolved()) {
                for (var c = 0; c < tempSquare.choices.length; ++c) {
                    picks.push(tempSquare.choices[c]);
                }
            }
        }
        var solvedNum = 0;
        for (var i = 0; i < picks.length; ++i) {
            var tempNum = picks[i];
            // if there is only one square that can take this number
            if (this.countNumInArray(tempNum, picks) === 1) {
                solvedNum = tempNum;
                for (var k = 0; k < 9; ++k) {
                    var tempSquare = this.allChoices[x][k];
                    if (this.contains(solvedNum, tempSquare.getChoices())) {
                        tempSquare.setChoice(solvedNum);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    this.oneOptionInSquare = function(x, y) {
        var picks = [];
        var tempX = Math.floor(x / 3) * 3;
        var tempY = Math.floor(y / 3) * 3;
        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 3; ++j) {
                var tempSquare = this.allChoices[tempX + i][tempY + j];
                if (!tempSquare.isSolved()) {
                    for (var c = 0; c < tempSquare.choices.length; ++c) {
                        picks.push(tempSquare.choices[c]);
                    }
                }
            }
        }
        var solvedNum = 0;
        for (var i = 0; i < picks.length; ++i) {
            var tempNum = picks[i];
            // if there is only one square that can take this number
            if (this.countNumInArray(tempNum, picks) === 1) {
                solvedNum = tempNum;
                for (var k = 0; k < 3; ++k) {
                    for (var m = 0; m < 3; ++m) {
                        var tempSquare = this.allChoices[tempX + k][tempY + m];
                        if (this.contains(solvedNum, tempSquare.getChoices())) {
                            tempSquare.setChoice(solvedNum);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    this.printBoard = function() {
        this.board.printBoard();
        console.log("");
    }

}
/*
var board = [];
for (var i = 0; i < 9; ++ i) {
    board[i] = new Array(9);
}
for (var i = 0; i < this.board.length; i++) {
    for (var j = 0; j < 9; ++j) {
        board[i][j] = 0;
    }
};
board[0][0] = 2;
board[3][1] = 4;
board[4][1] = 5;
board[5][1] = 6;
board[6][1] = 9;
board[1][2] = 3;
board[3][2] = 1;
board[7][2] = 8;
board[1][3] = 6;
board[3][3] = 7;
board[5][3] = 3;
board[6][3] = 5;
board[8][3] = 1;
board[0][5] = 3;
board[2][5] = 8;
board[3][5] = 5;
board[5][5] = 4;
board[7][5] = 9;
board[1][6] = 2;
board[5][6] = 5;
board[7][6] = 7;
board[2][7] = 1;
board[3][7] = 6;
board[4][7] = 9;
board[5][7] = 7;
board[8][8] = 5;
/*
board[0][0] = 9;
board[2][0] = 7;
board[3][0] = 3;
board[6][0] = 8;
board[7][0] = 6;
board[8][0] = 5;
board[0][1] = 6;
board[1][1] = 3;
board[4][1] = 8;
board[7][1] = 9;
board[8][2] = 4;
board[2][3] = 9;
board[3][3] = 2;
board[4][3] = 5;
board[5][3] = 8;
board[0][4] = 5;
board[4][4] = 7;
board[8][4] = 6;
board[3][5] = 1;
board[4][5] = 9;
board[5][5] = 6;
board[6][5] = 2;
board[0][6] = 4;
board[1][7] = 5;
board[4][7] = 4;
board[7][7] = 7;
board[8][7] = 9;
board[0][8] = 2;
board[1][8] = 7;
board[2][8] = 6;
board[5][8] = 9;
board[6][8] = 4;
board[8][8] = 1;

finishedPuzzle = new Solver(board, false);
finishedPuzzle.solve();
finishedPuzzle.printBoard();*/
