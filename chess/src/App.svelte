<script lang="ts" context="module">
  const getInitialState = function () {
    return [
      [
        `<div
          class="piece black-rook"
          data-piece="black-rook1"
          draggable="true"
        >&#9820;</div>`,
        `<div
          class="piece black-knight"
          data-piece="black-knight1"
          draggable="true"
        >&#9822;</div>`,
        `<div
          class="piece black-bishop"
          data-piece="black-bishop1"
          draggable="true"
        >&#9821;</div>`,
        `<div
          class="piece black-queen"
          data-piece="black-queen"
          draggable="true"
        >&#9819;</div>`,
        `<div
          class="piece black-king"
          data-piece="black-king"
          draggable="true"
        >&#9818;</div>`,
        `<div
          class="piece black-bishop"
          data-piece="black-bishop2"
          draggable="true"
        >&#9821;</div>`,
        `<div
          class="piece black-knight"
          data-piece="black-knight2"
          draggable="true"
        >&#9822;</div>`,
        `<div
          class="piece black-rook"
          data-piece="black-rook2"
          draggable="true"
        >&#9820;</div>`
      ],
      [
        `<div
          class="piece pawn"
          data-piece="black-pawn1"
          draggable="true"
        >&#9823;</div>`,
        `<div
          class="piece pawn"
          data-piece="black-pawn2"
          draggable="true"
        >&#9823;</div>`,
        `<div
          class="piece pawn"
          data-piece="black-pawn3"
          draggable="true"
        >&#9823;</div>`,
        `<div
          class="piece pawn"
          data-piece="black-pawn4"
          draggable="true"
        >&#9823;</div>`,
        `<div
          class="piece pawn"
          data-piece="black-pawn5"
          draggable="true"
        >&#9823;</div>`,
        `<div
          class="piece pawn"
          data-piece="black-pawn6"
          draggable="true"
        >&#9823;</div>`,
        `<div
          class="piece pawn"
          data-piece="black-pawn7"
          draggable="true"
        >&#9823;</div>`,
        `<div
          class="piece pawn"
          data-piece="black-pawn8"
          draggable="true"
        >&#9823;</div>`
      ],

      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],

      [
        `<div
          class="piece pawn"
          data-piece="white-pawn1"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`,
        `<div
          class="piece pawn"
          data-piece="white-pawn2"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`,
        `<div
          class="piece pawn"
          data-piece="white-pawn3"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`,
        `<div
          class="piece pawn"
          data-piece="white-pawn4"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`,
        `<div
          class="piece pawn"
          data-piece="white-pawn5"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`,
        `<div
          class="piece pawn"
          data-piece="white-pawn6"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`,
        `<div
          class="piece pawn"
          data-piece="white-pawn7"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`,
        `<div
          class="piece pawn"
          data-piece="white-pawn8"
          draggable="true"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
        >&#9817;</div>`
      ],
      [
        `<div
          class="piece white-rook"
          data-piece="white-rook1"
          draggable="true"
        >&#9814;</div>`,
        `<div
          class="piece white-knight"
          data-piece="white-knight1"
          draggable="true"
        >&#9816;</div>`,
        `<div
          class="piece white-bishop"
          data-piece="white-bishop1"
          draggable="true"
        >&#9815;</div>`,
        `<div
          class="piece white-queen"
          data-piece="white-queen"
          draggable="true"
        >&#9813;</div>`,
        `<div
          class="piece white-king"
          data-piece="white-king"
          draggable="true"
        >&#9812;</div>`,
        `<div
          class="piece white-bishop"
          data-piece="white-bishop2"
          draggable="true"
        >&#9815;</div>`,
        `<div
          class="piece white-knight"
          data-piece="white-knight2"
          draggable="true"
        >&#9816;</div>`,
        `<div
          class="piece white-rook"
          data-piece="white-rook2"
          draggable="true"
        >&#9814;</div>`
      ]
    ];
  };

  const rowMap = {
    0: '8',
    1: '7',
    2: '6',
    3: '5',
    4: '4',
    5: '3',
    6: '2',
    7: '1'
  };

  const colMap = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd',
    4: 'e',
    5: 'f',
    6: 'g',
    7: 'h'
  };

  const pieceMap = {
    king: 'K',
    queen: 'Q',
    bishop: 'B',
    knight: 'N',
    rook: 'R',
    pawn: ''
  };

  const Board = function (params = {}) {
    this.pieceSpace = params.pieceSpace || getInitialState(),
    this.history = params.history || [],
    this.turn = params.turn || 'white',
    this.palyerInCheck = params.palyerInCheck || false,
    this.whiteCanCastleLong = params.whiteCanCastleLong || true,
    this.whiteCanCastleShort = params.whiteCanCastleShort || true,
    this.blackCanCastleLong = params.blackCanCastleLong || true,
    this.blackCanCastleShort = params.blackCanCastleShort || true
  };

  Board.prototype.doMove = function (piece, from, to) {
    const color = this.getPieceColor(piece);
    const pieceName = this.getPieceName(piece);

    //console.log(`Moving ${piece} from ${from} to ${to}`);

    // NOTE: it's important that we do these steps in the correct order

    // en passant is the only move in chess where the captured piece is not
    // on the square the capturing piece is moving to

    const enPassant = this.isEnPassant(from, to);
    if (enPassant) {
      if (color === 'black') this.pieceSpace[to[0] - 1][to[1]] = '';
      if (color === 'white') this.pieceSpace[to[0] + 1][to[1]] = '';
    }

    this.history.push({
      from: from,
      to: to,
      piece: piece,
      notation: this.getMoveNotation(from, to),
      capture: this.getCapturedPiece(from, to),
      enPassant: enPassant
    });

    // do the actual move
    this.pieceSpace[to[0]][to[1]] = this.pieceSpace[from[0]][from[1]];
    this.pieceSpace[from[0]][from[1]] = '';

    // if castling also move the second piece in the castling
    if (this.isCastle(pieceName, from, to)) {
      // player moved king to the left
      if (from[1] === 4 && to[1] === 2) {
        this.pieceSpace[from[0]][3] = this.pieceSpace[from[0]][0];
        this.pieceSpace[from[0]][0] = '';
      }
      // player moved king to the right
      if (from[1] === 4 && to[1] === 6) {
        this.pieceSpace[from[0]][5] = this.pieceSpace[from[0]][7];
        this.pieceSpace[from[0]][7] = '';
      }
    }

    // track if castling is still valid
    if (pieceName === 'rook') {
      const rookNumber = piece.match('1') ? 1 : 2;
      if (color === 'white' && rookNumber === 1) {
        this.whiteCanCastleLong = false;
      } else if (color === 'white' && rookNumber === 2) {
        this.whiteCanCastleShort = false;
      } else if (color === 'black' && rookNumber === 1) {
        this.blackCanCastleLong = false;
      } else if (color === 'black' && rookNumber === 2) {
        this.blackCanCastleShort = false;
      }
    } else if (pieceName === 'king') {
      if (color === 'white') {
        this.whiteCanCastleLong = false;
        this.whiteCanCastleShort = false;
      } else if (color === 'black') {
        this.blackCanCastleLong = false;
        this.blackCanCastleShort = false;
      }
    }

    // See if this move put the other player in check
    const opponentColor = this.getOpponentColor(color);
    if (this.inCheck(opponentColor)) {
      this.palyerInCheck = true;
    } else {
      this.palyerInCheck = false;
    }

    this.turn = this.getOpponentColor(this.turn);
  };

  // undo the last move. useful for testing future state of a board
  Board.prototype.undoMove = function (piece, from, to) {
    const lastMove = this.history[this.history.length - 1];
    // TODO: this won't undo a castle ATM, but we are only using this to test checkmate so thats fine
    this.doMove(lastMove.piece, lastMove.to, lastMove.from);

    // undo catpures
    if (lastMove.capture) {
      const capturedPiece = lastMove.capture;
      const captureLoc = lastMove.enPassant ? [lastMove.from[0], lastMove.to[1]] : [lastMove.to[0], lastMove.to[1]];

      this.pieceSpace[captureLoc[0]][captureLoc[1]] = capturedPiece;
    }

    this.turn = this.getPieceColor(lastMove.piece);
    // remove the "undo" and the move from history
    this.history.pop();
    this.history.pop();
  }

  // this will indicate if the (from, to) move is allowed because of en passant
  Board.prototype.isEnPassant = function (from, to) {
    if (this.getPieceName(this.pieceSpace[from[0]][from[1]]) !== 'pawn') return false;
    // look through history and decide
    const lastMove = this.history[this.history.length - 1];
    if (!lastMove) return false;

    if (this.getPieceName(lastMove.piece) !== 'pawn') return false;
    const pawnColor = this.getPieceColor(lastMove.piece);

    // make sure the last move was a 2 square move
    if (pawnColor === 'white' && lastMove.to[0] !== 4) return false;
    if (pawnColor === 'white' && lastMove.from[0] !== 6) return false;
    if (pawnColor === 'black' && lastMove.to[0] !== 3) return false;
    if (pawnColor === 'black' && lastMove.from[0] !== 1) return false;

    // make sure that the proposed move puts the pawn 1 square behind the last move
    if (lastMove.to[1] !== to[1]) return false;
    if (pawnColor === 'white' && lastMove.to[0] - to[0] !== -1) return false;
    if (pawnColor === 'black' && lastMove.to[0] - to[0] !== 1) return false;

    return true;
  };

  Board.prototype.getMoveNotation = function (from, to) {
    const fromSquare = rowMap[from[0]] + colMap[from[1]];
    const toSquare = rowMap[to[0]] + colMap[to[1]];

    // Move hasn't happened yet
    const piece = pieceMap[this.getPieceName(this.pieceSpace[from[0]][from[1]])];
    const capture = !!this.pieceSpace[to[0]][to[1]] || this.isEnPassant(from, to);

    return `${piece}${fromSquare}${capture ? 'x' : '-'}${toSquare}`;
  };

  // this gets the piece that would be captured if from->to move happend
  Board.prototype.getCapturedPiece = function (from, to) {
    if (!from) return;
    const enPassant = this.isEnPassant(from, to);

    // if it is en passant, the piece on the "from" row and "to" column is being captured
    if (enPassant) return this.pieceSpace[from[0]][to[1]];

    // this will be a piece string, or an empty string
    return this.pieceSpace[to[0]][to[1]];
  };

  Board.prototype.isCastle = function (pieceName, from, to) {
    if (pieceName !== 'king') return false;

    if (from[0] === 0 && from[1] === 4 && ((to[0] === 0 && to[1] === 2) || (to[0] === 0 && to[1] === 6))) {
      return true;
    }
    if (from[0] === 7 && from[1] === 4 && ((to[0] === 7 && to[1] === 2) || (to[0] === 7 && to[1] === 6))) {
      return true;
    }
  };

  Board.prototype.getKingLocation = function (color) {
    let rowNum, colNum;
    this.pieceSpace.find((row, i) => {
      const king = row.find((square, j) => {
        const name = this.getPieceName(square);
        const clr = this.getPieceColor(square);

        if (name === 'king' && clr === color) {
          rowNum = i;
          colNum = j;
          return true;
        }
      });

      if (king) return true;
    });

    return [rowNum, colNum]
  }

  Board.prototype.getPieceName = function (text) {
    if (text.match('pawn')) return 'pawn';
    if (text.match('rook')) return 'rook';
    if (text.match('knight')) return 'knight';
    if (text.match('bishop')) return 'bishop';
    if (text.match('queen')) return 'queen';
    if (text.match('king')) return 'king';
  };

  Board.prototype.getPieceColor = function (text) {
    if (text.match('white')) return 'white';
    if (text.match('black')) return 'black';

    return '';
  };

  Board.prototype.getOpponentColor = function (piece) {
    return this.getPieceColor(piece) === 'white' ? 'black' : 'white';
  };

  Board.prototype.isValidPhysics = function (pieceText, from, to) {
    const name = this.getPieceName(pieceText);
    const color = this.getPieceColor(pieceText);

    // you can never take your own piece
    const takePiece = this.pieceSpace[to[0]][to[1]];
    const takeColor = this.getPieceColor(takePiece);
    if (takeColor === color) return false;

    // piece must be moving
    if (from[0] === to[0] && from[1] === to[1]) return false;

    if (this.isCastle(name, from, to)) return this.canCastle(pieceText, from, to);

    if (name == 'pawn') {
      // check for en passant
      if (this.isEnPassant(from, to)) return true;
      // ensure it is moving forward one square, or 2 if first move
      if (color === 'white' && from[0] === 6 && from[0] - to[0] !== 1 && from[0] - to[0] !== 2) return false;
      if (color === 'white' && from[0] !== 6 && from[0] - to[0] !== 1) return false;
      if (color === 'black' && from[0] === 1 && to[0] - from[0] !== 1 && to[0] - from[0] !== 2) return false;
      if (color === 'black' && from[0] !== 1 && to[0] - from[0] !== 1) return false;

      // if moving sideways, make sure it's only one square and it's taking a piece
      if (Math.abs(from[1] - to[1]) > 1) return false;
      if (Math.abs(from[1] - to[1]) === 1) { // is sideways 1 square
        // when moving diagonal only 1 square forward is allowed
        if (Math.abs(from[0] - to[0]) !== 1) return false;

        // when moving diagonal you must be taking a piece
        if (!takeColor) return false;
      }

      // if moving forward, ensure nothing is in its way
      if (Math.abs(from[1] - to[1]) === 0) {
        // cannot take by going forward
        if (takePiece) return false;

        if (!this.pathClear(from, to)) return false;
      }

      return true;
    }
    if (name == 'rook') {
      // either row has to stay the same, or col has to stay the same
      if (from[1] !== to[1] && from[0] !== to[0]) return false;

      if (!this.pathClear(from, to)) return false;
      return true;
    }
    if (name == 'knight') {
      // the knight must move sideways, either 1 or 2 squares
      if (Math.abs(from[1] - to[1]) !== 1 && Math.abs(from[1] - to[1]) !== 2) return false;

      // if move is sideways 1, must be up/down 2
      if (Math.abs(from[1] - to[1]) === 1 && Math.abs(from[0] - to[0]) !== 2) return false;
      // if move is sideways 2, must be up/down 1
      if (Math.abs(from[1] - to[1]) === 2 && Math.abs(from[0] - to[0]) !== 1) return false;

      return true;
    }
    if (name == 'bishop') {
      // ensure it's diagonal
      if (Math.abs(from[1] - to[1]) !== Math.abs(from[0] - to[0])) return false;
      if (!this.pathClear(from, to)) return false;

      return true;
    }
    if (name == 'queen') {
      // up/down, left/right, or diagonal only
      if (from[1] !== to[1] && from[0] !== to[0] && Math.abs(from[1] - to[1]) !== Math.abs(from[0] - to[0])) return false;
      if (!this.pathClear(from, to)) return false;

      return true;
    }
    if (name == 'king') {
      // ensure the move is only one square, NOTE: we already checked if this is a castling
      if (Math.abs(from[1] - to[1]) > 1 || Math.abs(from[0] - to[0]) > 1) return false;
      return true;
    }
  }

  Board.prototype.pathClear = function (from, to) {
    // piece must be moving
    if (from[0] === to[0] && from[1] === to[1]) return false;

    // path can only be up/down or diagonal
    if (from[0] === to[0]) { // side to side
      const colInc = from[1] < to[1] ? 1 : -1;

      const currentRow = from[0]
      let currentCol = from[1] + colInc;
      while (currentCol !== to[1] && currentCol > -1 && currentCol < 8) {
        if (this.pieceSpace[currentRow][currentCol]) return false;

        currentCol += colInc;
      }
      return true;
    }
    if (from[1] === to[1]) { // up or down
      const rowInc = from[0] < to[0] ? 1 : -1;

      let currentRow = from[0] + rowInc;
      const currentCol = from[1];
      while (currentRow !== to[0] && currentRow > -1 && currentRow < 8) {
        if (this.pieceSpace[currentRow][currentCol]) return false;

        currentRow += rowInc;
      }
      return true;
    }
    if (Math.abs(from[1] - to[1]) === Math.abs(from[0] - to[0])) { // diagonal
      const rowInc = from[0] < to[0] ? 1 : -1;
      const colInc = from[1] < to[1] ? 1 : -1;

      let currentRow = from[0] + rowInc;
      let currentCol = from[1] + colInc;
      while (currentRow !== to[0] && currentRow > -1 && currentRow < 8) { // this could be currentCol too, it's same number of loops
        if (this.pieceSpace[currentRow][currentCol]) return false;

        currentRow += rowInc;
        currentCol += colInc;
      }
      return true;
    }

    return false;
  }

  // return true/false if this from->to is allowed to castle
  Board.prototype.canCastle = function (pieceText, from, to) {
    if (this.palyerInCheck) return false;

    const pieceName = this.getPieceName(pieceText)
    const color = this.getPieceColor(pieceText);

    if (!this.pathClear(from, to)) return false;

    // ensure they are not castling through check
    const colInc = from[1] < to[1] ? 1 : -1;

    const currentRow = from[0]
    let currentCol = from[1] + colInc;
    while (currentCol !== to[1] && currentCol > -1 && currentCol < 8) {
      if (this.inCheck(color, [currentRow, currentCol])) return false;

      currentCol += colInc;
    }

    // basic approach of just checking every possible castle move and if it's still allowed
    if (pieceName === 'rook') {
      const rookNumber = pieceText.match('1') ? 1 : 2;
      if (color === 'white' && rookNumber === 1 && this.whiteCanCastleLong) return true;
      if (color === 'white' && rookNumber === 2 && this.whiteCanCastleShort) return true;
      if (color === 'black' && rookNumber === 1 && this.blackCanCastleLong) return true;
      if (color === 'black' && rookNumber === 2 && this.blackCanCastleShort) return true;
    }
    if (pieceName === 'king') {
      const big = to[1] === 2;
      if (color === 'white' && big && this.whiteCanCastleLong) return true;
      if (color === 'white' && !big && this.whiteCanCastleShort) return true;

      if (color === 'black' && big && this.blackCanCastleLong) return true;
      if (color === 'black' && !big && this.blackCanCastleShort) return true;
    }

    return false;
  };

  // Go through every one of the opponents pieces and see if they can move to the location of the king
  // optionally pass in a location of the king, or just use the current location
  Board.prototype.inCheck = function (color, kingLocation = this.getKingLocation(color)) {
    if (color !== 'black' && color !== 'white') throw new Error('inCheck must be passed a color');

    for (let i = 0; i < this.pieceSpace.length; i++) {
      const row = this.pieceSpace[i];
      for (let j = 0; j < row.length; j++) {
        const square = row[j];

        if (!square || this.getPieceColor(square) === color) continue;

        if (this.isValidPhysics(square, [i, j], kingLocation)) return true;
      }
    }

    return false;
  }

  // TODO: need a way to deal with pawns making it to the back line

</script>

<script lang="ts">
  const gameBoard = new Board();

  let winner;
  let pieceSpace = gameBoard.pieceSpace
  let history = gameBoard.history;
  let turn = gameBoard.turn;
  let palyerInCheck = gameBoard.palyerInCheck;
  let whiteCanCastleLong = gameBoard.whiteCanCastleLong;
  let whiteCanCastleShort = gameBoard.whiteCanCastleShort;
  let blackCanCastleLong = gameBoard.blackCanCastleLong;
  let blackCanCastleShort = gameBoard.blackCanCastleShort;

  function pickupPiece(eve) {
    eve.dataTransfer.setData('piece', eve.target?.dataset.piece);
    eve.dataTransfer.setData('location', eve.target?.parentElement.dataset.location);
    eve.target.style['background-color'] = 'yellow';
  }

  function putdownPiece(eve) {
    eve.target.style['background-color'] = '';
  }

  function dragOver(eve) {
   // this listener is required to enable dropping
   eve.preventDefault();
  }

  function dropPiece(eve) {
    eve.preventDefault();
    if (winner) return;
    const moveTo = eve.currentTarget.dataset.location.split(',').map(str => parseInt(str, 10));
    const moveFrom = eve.dataTransfer.getData('location').split(',').map(str => parseInt(str, 10));
    const piece = eve.dataTransfer.getData('piece');

    // something went wrong in the event cycle, so we bail
    if (!(moveTo && moveFrom && piece)) return;

    console.log(`Trying to move ${piece} from ${moveFrom} to ${moveTo}`);
    // enforce rules of the game!
    const validMove = isMoveAllowed(moveFrom, moveTo);

    if (!validMove) return;

    // TODO: call to tableland with new board state
    gameBoard.doMove(piece, moveFrom, moveTo);

    // Svelte reactivity implementation means that we need to
    // trigger the changes to the variable assignments directly
    // More detail can be found here: https://svelte.dev/docs#component-format-script-2-assignments-are-reactive
    trigger();

    // Did they win?
    const opponentColor = gameBoard.getOpponentColor(piece);
    if (!gameBoard.inCheck(opponentColor)) return;

    // go through every square with a piece from a given color and see if there is any move that is allowed
    // If the move is allowed, that means the "color" is no longer in check, hence it's not checkmate
    const ghostBoard = getGhostBoard();

    for (let i = 0; i < ghostBoard.pieceSpace.length; i++) {
      const row = ghostBoard.pieceSpace[i];
      for (let j = 0; j < row.length; j++) {
        const square = row[j];

        if (!square || ghostBoard.getPieceColor(square) !== opponentColor) continue;

        for (let k = 0; k < ghostBoard.pieceSpace.length; k++) {
          const row2 = ghostBoard.pieceSpace[k];
          for (let l = 0; l < row2.length; l++) {
            const square2 = row2[j];

            if (!ghostBoard.isValidPhysics(square, [i, j], [k, l])) continue;
            ghostBoard.doMove(square, [i, j], [k, l]);

            // if any move results in not being in check they are not in checkmate
            if (!ghostBoard.inCheck(opponentColor)) {
              console.log('Not checkmate');
              console.log(ghostBoard.inCheck(opponentColor));
              console.log(JSON.stringify(ghostBoard, null, 4))
              return;
            }

            ghostBoard.undoMove();
          }
        }
      }
    }

    winner = ghostBoard.getPieceColor(piece);
  }

  function trigger() {
    pieceSpace = gameBoard.pieceSpace
    history = gameBoard.history;
    turn = gameBoard.turn;
    palyerInCheck = gameBoard.palyerInCheck;
    whiteCanCastleLong = gameBoard.whiteCanCastleLong;
    whiteCanCastleShort = gameBoard.whiteCanCastleShort;
    blackCanCastleLong = gameBoard.blackCanCastleLong;
    blackCanCastleShort = gameBoard.blackCanCastleShort;
  }

  // are they allowed to make the move
  function isMoveAllowed(from, to) {
    const pieceText = gameBoard.pieceSpace[from[0]][from[1]];
    const color = gameBoard.getPieceColor(pieceText)

    // is it their turn
    if (color !== turn) return false;

    // is the movement allowed for the piece
    if (!gameBoard.isValidPhysics(pieceText, from, to)) return false;

    // ensure the move doesn't put the moving player in check

    // get a "ghostBoard" so we can make the move and see if the king is in check
    const ghostBoard = getGhostBoard();
    ghostBoard.doMove(pieceText, from, to);
    if (ghostBoard.inCheck(color)) return false;

    return true;
  }


  // get a clone of the board in it's current state.  This can be
  // used to see what potential moves would make a board look like
  function getGhostBoard() {
    const ghostBoard = new Board({
      pieceSpace: [...gameBoard.pieceSpace].map(row => [...row]),
      history: [...gameBoard.history].map(move => {
        return {...move};
      }),

      turn: String(turn),
      palyerInCheck: Boolean(palyerInCheck),
      whiteCanCastleLong: Boolean(whiteCanCastleLong),
      whiteCanCastleShort: Boolean(whiteCanCastleShort),
      blackCanCastleLong: Boolean(blackCanCastleLong),
      blackCanCastleShort: Boolean(blackCanCastleShort)
    });

    return ghostBoard;
  }

</script>

<main>
  <div class="head-info">
    <h1>Tableland Chess</h1>
  </div>
  <div class="flex-container">
    <div class="chessboard">

      {#each pieceSpace as row, rowIndex}
      {#each row as square, squareIndex}

        <div
          class="{((rowIndex % 2) + (squareIndex % 8)) % 2 ? 'black' : 'white'}"
          on:dragover="{dragOver}"
          on:drop="{dropPiece}"
          on:dragstart="{pickupPiece}"
          on:dragend="{putdownPiece}"
          data-location="{rowIndex},{squareIndex}"
        >
          {@html pieceSpace[rowIndex][squareIndex] }
        </div>

      {/each}
      {/each}

    </div>
    <div class="history">
      {#if !winner}
      <h3>
        Current Turn: {turn}
        {#if palyerInCheck}
        <span class="text-red">In Check!</span>
        {/if}
      </h3>
      {/if}

      {#if winner}
      <h3>
        Game Over
        <span class="text-red">{winner} is the Winner!</span>
      </h3>
      {/if}
      <h3>Moves</h3>

      <div class="flex-container">
        <table class="move-table">
          <tr>
            <th></th>
            <th>White</th>
          </tr>
          {#each history as move, i}
          {#if !(i % 2)}
          <tr>
            <td>{1 + (i / 2)}</td>
            <td>{move.notation}</td>
          </tr>
          {/if}
          {/each}
        </table>

        <table class="move-table">
          <tr>
            <th>Black</th>
          </tr>
          {#each history as move, i}
          {#if i % 2}
          <tr>
            <td>{move.notation}</td>
          </tr>
          {/if}
          {/each}
        </table>
      </div>

    </div>
  </div>
</main>

<style>

.head-info {
  text-align: center;
}

.flex-container {
  display: flex;
  align-items: flex-start;
}

.chessboard {
  width: 640px;
  height: 640px;
  margin: 0 1rem;
  border: 25px solid #333;
}

.history {
  margin: 0 auto;
  text-align: center;
}

.move-table {
  width: 50%;
  border-top: 1px solid black;
}

.black {
  float: left;
  width: 80px;
  height: 80px;
  background-color: #999;
  font-size: 50px;
  text-align: center;
  display: table-cell;
  vertical-align: middle;
}

.white {
  float: left;
  width: 80px;
  height: 80px;
  background-color: #fff;
  font-size:50px;
  text-align:center;
  display: table-cell;
  vertical-align:middle;
}

.text-red {
  color: red;
}

</style>