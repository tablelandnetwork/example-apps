<script lang="ts" context="module">
  const pieceCodes = {
    'black-rook': '&#9820;',
    'black-knight': '&#9822;',
    'black-bishop': '&#9821;',
    'black-queen': '&#9819;',
    'white-rook': '&#9814;',
    'white-knight': '&#9816;',
    'white-bishop': '&#9815;',
    'white-queen': '&#9813;'
  };
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

  Board.prototype.reset = function () {
    this.pieceSpace = getInitialState(),
    this.history = [],
    this.turn = 'white',
    this.palyerInCheck = false,
    this.whiteCanCastleLong = true,
    this.whiteCanCastleShort = true,
    this.blackCanCastleLong = true,
    this.blackCanCastleShort = true
  };

  Board.prototype.doMove = function (piece, from, to, promoted) {
    const color = this.getPieceColor(piece);
    const pieceName = this.getPieceName(piece);

    console.log(`Moving ${piece} from ${from} to ${to} ${promoted ? ` promoting to ${promoted}` : ''}`);

    // NOTE: it's important that we do these steps in the correct order

    // en passant is the only move in chess where the captured piece is not
    // on the square the capturing piece is moving to, we handle that here
    const enPassant = this.isEnPassant(from, to);
    if (enPassant) {
      if (color === 'black') this.pieceSpace[to[0] - 1][to[1]] = '';
      if (color === 'white') this.pieceSpace[to[0] + 1][to[1]] = '';
    }

    this.history.push({
      from: from,
      to: to,
      piece: piece,
      notation: this.getMoveNotation(from, to, promoted),
      capture: this.getCapturedPiece(from, to),
      enPassant: enPassant
    });

    // do the actual move
    this.pieceSpace[to[0]][to[1]] = this.pieceSpace[from[0]][from[1]];
    this.pieceSpace[from[0]][from[1]] = '';

    // if needed to the promotion
    if (promoted) {
      const promoCount = this.pieceSpace.reduce((highestNumber, row) => {
        const rowNum = row.reduce((highestNum, cell) => {
          if (this.getPieceColor(cell) !== color) return;
          if (this.getPieceName(cell) !== promoted) return;

          const numString = this.getPieceNumber(cell);
          if (numString > highestNumber) return numString;

          return highestNum
        }, '0');

        if (rowNum > highestNumber) return rowNum;

        return highestNumber;
      }, '0');
      this.pieceSpace[to[0]][to[1]] = `<div
          class="piece ${color}-${promoted}"
          data-piece="${color}-${promoted}${Number(promoCount) + 1}"
          draggable="true"
        >${pieceCodes[`${color}-${promoted}`]}</div>`
    }

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

  Board.prototype.getMoveNotation = function (from, to, promoted) {
    const fromSquare = rowMap[from[0]] + colMap[from[1]];
    const toSquare = rowMap[to[0]] + colMap[to[1]];

    // Move hasn't happened yet
    const piece = pieceMap[this.getPieceName(this.pieceSpace[from[0]][from[1]])];
    const capture = !!this.pieceSpace[to[0]][to[1]] || this.isEnPassant(from, to);

    return `${piece}${fromSquare}${capture ? 'x' : '-'}${toSquare}${promoted ? pieceMap[promoted] : ''}`;
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

  // max of 10 pieces with same type
  Board.prototype.getPieceNumber = function (text) {
    if (text.match('0')) return '0';
    if (text.match('1')) return '1';
    if (text.match('2')) return '2';
    if (text.match('3')) return '3';
    if (text.match('4')) return '4';
    if (text.match('5')) return '5';
    if (text.match('6')) return '6';
    if (text.match('7')) return '7';
    if (text.match('8')) return '8';
    if (text.match('9')) return '9';


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

  function colorTransform(i, color) {
    if (color === 'black') return {
      0: 7,
      1: 6,
      2: 5,
      3: 4,
      4: 3,
      5: 2,
      6: 1,
      7: 0
    }[i];

    return i;
  }

  function stringToNumber(str) {
    const num = parseInt(str, 10);
    if (isNaN(num)) return;
    return num;
  }

</script>

<script lang="ts">
  import {
    tick,
    onMount
  } from 'svelte';
  import { utils } from 'ethers';
  import {
    Alert,
    Button,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalActions,
    Radio,
    Spinner
  } from '@specialdoom/proi-ui';
  // The store is custom which means svelte will inject all exports as a variable with a `$` prefix
  import {
    alerts,
    audience,
    blackAddress,
    bounty,
    connected,
    currentGame,
    gameId,
    games,
    owner,
    ownedGames,
    init,
    moves,
    myAddress,
    myColor,
    officialWinner,
    whiteAddress
  } from './store';

  const gameBoard = new Board();
  let autoPlay;

  onMount(async function () {
    moves.subscribe(async mvs => {
      if (mvs.length === 0) {
        gameBoard.reset();
        trigger();
        return;
      }

      for (let i = Number(gameBoard.history.length); i < mvs.length; i++) {
        const moveStr = mvs[i];
        const parts = moveStr.split(':');
        const piece = parts[0];
        const from = parts[1].split(',').map(stringToNumber);
        const to = parts[2].split(',').map(stringToNumber);
        const promoted = parts[3]

        if (!(piece && from && to)) {
          alerts.addAlert(
            'Looks like the game state is invalid. We can\'t let you finish this game, but you can start a new one.',
            'error'
          );
        }

        updateBoard(piece, from, to, promoted);
        await tick();
      }
    });

    const params = new URLSearchParams(location.search);
    autoPlay = !!params.get('auto');

    if (autoPlay) {
      await games.getGameMoves(params.get('game'));
      games.startAutoPlay();
    }
  })

  const connect = async function () {
    await init();
    await games.findGames();
  };

  const loadGame = async function (game) {
    newGame = false;
    winner = '';
    await games.loadGame(game.id, game.player2, game.player1);
  };
  const unloadGame = function () {
    games.unloadGame();
  }

  const logout = function () {
    location.reload();
  };

  let newPlayer1Address = '';
  let newPlayer2Address = '';
  let minting = false;
  let newGame;
  let bountyGame;
  let newBounty;
  let addingBounty = false;

  // vars for promoting pawns that make the backline
  let showPromoteModal = false;
  let promoteColor;

  let winner;

  $: validMint = function () {
    try {
      // make sure the wallet address is valid
      newPlayer1Address = utils.getAddress(newPlayer1Address);
      newPlayer2Address = utils.getAddress(newPlayer2Address);
    } catch (err) {
      return false;
    }

    return true;
  };
  $: validBounty = function () {
    if (newBounty && newBounty > 0) return true;

    return false;
  };
  $: canAddBounty = function (game) {
    if (game.player2 === game.owner) return false;
    if (game.player1 === game.owner) return false;
    return true;
  };

  const mint = async function () {
    if (!validMint()) return;

    minting = true;
    try {
      const gameId = await games.mintGame({
        player1: newPlayer1Address,
        player2: newPlayer2Address
      });

      // if there is no gameId something went wrong
      if (!gameId) {
        minting = false;
        return;
      }

      newGame = {
        id: gameId.toNumber(),
        player1: newPlayer1Address.toString(),
        player2: newPlayer2Address.toString()
      };

      newPlayer1Address = '';
      newPlayer2Address = '';
    } catch (err) {
      minting = false;
      console.log(err);
    }
    minting = false;
  };

  // if game arg is provided we will reload that
  // game after bounty transaction is finished
  const addBounty = async function (game) {
    addingBounty = true;
    await games.addBounty(bountyGame, newBounty);
    if (game) {
      await loadGame(game);
    }
    newBounty = undefined;
    bountyGame = undefined;
    addingBounty = false;
  };

  const certifyWinner = async function (gameId) {
    await games.certifyWinner(gameId, winner);
  };

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

  async function dropPiece(eve) {
    eve.preventDefault();
    if (winner) return;
    const moveTo = eve.currentTarget.dataset.location.split(',').map(stringToNumber);
    const moveFrom = eve.dataTransfer.getData('location').split(',').map(stringToNumber);
    const piece = eve.dataTransfer.getData('piece');

    // something went wrong in the event cycle, so we bail
    if (!(moveTo && moveFrom && piece)) return;

    console.log(`Trying to move ${piece} from ${moveFrom} to ${moveTo}`);
    // enforce rules of the game!
    const validMove = isMoveAllowed(moveFrom, moveTo);

    if (!validMove) return;

    const promotedTo = await getPromotion(piece, moveFrom, moveTo);

    // call to tableland with new board state
    // TODO: we are not waiting for response
    moves.doMove(`${piece}:${moveFrom}:${moveTo}:${promotedTo}`);
    updateBoard(piece, moveFrom, moveTo, promotedTo);
  }

  function updateBoard(piece, from, to, promoted) {
    gameBoard.doMove(piece, from, to, promoted);

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

    // is it their turn and there piece
    if (color !== turn) return false;
    if (color !== $myColor) return false;

    // is the movement allowed for the piece
    if (!gameBoard.isValidPhysics(pieceText, from, to)) return false;

    // ensure the move doesn't put the moving player in check

    // get a "ghostBoard" so we can make the move and see if the king is in check
    const ghostBoard = getGhostBoard();
    ghostBoard.doMove(pieceText, from, to);
    if (ghostBoard.inCheck(color)) return false;

    return true;
  }

  const promoter = {
    listeners: [],
    once: function (listener) {
      this.listeners.push(listener);
    },
    promote: function (data) {
      while (this.listeners.length) {
        this.listeners.pop()(data);
      }
    }
  }

  function getPromotion (piece, moveFrom, moveTo) {
    // if it's not a pawn there's nothing to do
    if (!piece.match('pawn')) return '';

    // see if the pawn made it to the backline
    const color = gameBoard.getPieceColor(piece);
    const row = moveTo[0];
    const backline = color === 'black' ? row === 7 : row === 0;

    if (!backline) return '';

    showPromoteModal = true;
    promoteColor = color;
    return new Promise(function (resolve, reject) {
      promoter.once(function (piece) {
        showPromoteModal = false;
        promoteColor = undefined;

        resolve(piece);
      });
    });
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

<main class="relative">
  {#if autoPlay}
    <div class="flex items-start mt-8">
      <div class="chessboard">

        {#each pieceSpace as row, rowIndex}
        {#each row as square, squareIndex}

          <div
            class="{((rowIndex % 2) + (squareIndex % 8)) % 2 ? 'black' : 'white'}"
            on:dragover="{dragOver}"
            on:drop="{dropPiece}"
            on:dragstart="{pickupPiece}"
            on:dragend="{putdownPiece}"
            data-location="{colorTransform(rowIndex, $myColor)},{colorTransform(squareIndex, $myColor)}"
          >
            {@html pieceSpace[colorTransform(rowIndex, $myColor)][colorTransform(squareIndex, $myColor)] }
          </div>

        {/each}
        {/each}

      </div>
    </div>
  {/if}

  {#if !autoPlay}

    {#if newGame}
    <Modal bind:visible={newGame} title="Your Game has been minted!">

      <ModalBody>
        Here's the link to
        <span on:click="{() => loadGame(newGame)}" class="cursor-pointer hover:underline text-blue-300 text-ellipsis overflow-hidden">
          your game
        </span>.
        Share this with the the Wallets of the players you specified.
        You can now set a bounty on the game, which will be paid in full to the winner when you certify the game outcome.
      </ModalBody>

    </Modal>
    {/if}

    {#if bountyGame}
    <Modal bind:visible={bountyGame} title="Add to the bounty">

      <ModalBody>
        Add to the bounty for this game
        <div class="grid grid-cols-3">
          <div class="col-span-2">
            <Input placeholder="value in ETH" type="number" className="false" bind:value="{newBounty}" />
          </div>
          <div class="align-middle">
            {#if addingBounty}
            <Spinner label="Adding..." />
            {/if}

            {#if !addingBounty}
            <Button type="primary" small on:click="{() => addBounty($currentGame)}" disabled="{!validBounty()}">
              Submit
            </Button>
            {/if}
          </div>
        </div>

        The bounty is paid in full, minus gas, to the winner of the game.
        Note the winner must be certified on chain by the token owner, it is not automatically assigned by this client app.
      </ModalBody>

    </Modal>
    {/if}

    <Modal bind:visible={showPromoteModal} title="Choose Promotion">

      <ModalBody>
        <div class="flex">
          {#if promoteColor === 'black'}
          <div
            on:click="{() => promoter.promote('rook')}"
            class="cursor-pointer px-4"
          >rook &#9820;</div>
          <div
            on:click="{() => promoter.promote('knight')}"
            class="cursor-pointer px-4"
          >knight &#9822;</div>
          <div
            on:click="{() => promoter.promote('bishop')}"
            class="cursor-pointer px-4"
          >bishop &#9821;</div>
          <div
            on:click="{() => promoter.promote('queen')}"
            class="cursor-pointer px-4"
          >queen &#9819;</div>
          {/if}
          {#if promoteColor === 'white'}
          <div
            on:click="{() => promoter.promote('rook')}"
            class="cursor-pointer px-4"
          >rook &#9814;</div>
          <div
            on:click="{() => promoter.promote('knight')}"
            class="cursor-pointer px-4"
          >knight &#9816;</div>
          <div
            on:click="{() => promoter.promote('bishop')}"
            class="cursor-pointer px-4"
          >bishop &#9815;</div>
          <div
            on:click="{() => promoter.promote('queen')}"
            class="cursor-pointer px-4"
          >queen &#9813;</div>
          {/if}
        </div>
      </ModalBody>

    </Modal>

    <div class="fixed left-4 right-4">
      {#each $alerts as alert}
      <div on:click="{alerts.clearAlert(alert)}" class="cursor-pointer">
        <Alert type="{alert.type}">{alert.message}</Alert>
      </div>
      {/each}
    </div>
    <div class="text-center">
      <div class="mt-8 grid grid-cols-6 gap-4 text-3xl text-center font-mono font-semibold">
        <div class="col-span-5">

          <span on:click="{unloadGame}" class="cursor-pointer hover:underline text-blue-300">Tableland Chess</span>

          {#if typeof $gameId === 'number'}

            Game ID: {$gameId}

            {#if $audience && !$owner && !winner}
            <p class="text-sm">You are in the audience, if this is by mistake try loging out and reconnecting</p>
            {/if}

            {#if $owner}
            <p class="text-sm">
              You are the owner of this game.

              {#if winner && $bounty && !$officialWinner}
              <span on:click="{() => certifyWinner($gameId)}" class="cursor-pointer hover:underline text-blue-300">
                Certify Winner
              </span>
              {/if}
            </p>
            {/if}

            {#if $myColor && !winner}
              {#if  turn === $myColor}
              <b>Your Turn</b>
              {/if}
              {#if  turn !== $myColor}
              <b>Opponent's Turn</b>
              {/if}
              {#if palyerInCheck}
              <span class="text-red">{turn} in check!</span>
              {/if}
            {/if}

            {#if winner}
            <h3>
              Game Over
              <span class="text-red">{winner} is the {$officialWinner ? 'certified' : ''} Winner!</span>
            </h3>
            {/if}
            <p class="text-sm">White: {$whiteAddress}</p>
            <p class="text-sm">Black: {$blackAddress}</p>
            <p class="text-sm">
              Game Bounty: {$currentGame.bounty && utils.formatEther($currentGame.bounty)}
              {#if canAddBounty($currentGame)}
              <span on:click="{() => bountyGame = $currentGame}" class="pl-4 cursor-pointer hover:underline text-blue-300">
                Add Bounty
              </span>
              {/if}
            </p>

            {#if !canAddBounty($currentGame)}
            <p class="text-xs text-gray-400">Cannot add bounty to this game because the owner is a player.</p>
            {/if}

            {#if $officialWinner}
            <p class="text-sm">Certified Winner: {$officialWinner}</p>
            {/if}
          {/if}
        </div>
        {#if $myAddress}
        <div class="text-sm text-center">
          Connected with <b>{$myAddress.slice(0, 5)}...{$myAddress.slice(-5)}</b>
          <span class="hover:underline cursor-pointer text-blue-300" on:click="{logout}">logout</span>
        </div>
        {/if}

      </div>
      
    </div>
    {#if !$connected}
    <div class="container-center">
      <button type="button" class="btn btn-connect cursor-pointer" on:click="{connect}">Connect To Tableland</button>
    </div>
    {/if}

    {#if $connected}
    <div class="flex items-start mt-8">

      {#if typeof $gameId !== 'number'}
      <div class="w-1/2 px-8 overflow-wrap">

        <p class="font-bold">Games you are playing</p>
        {#if $games.length}
        {#each $games as game}
        <p class="w-full border border-solid-bottom border-gray-300"></p>
        <p class="truncate">
          Game ID: <span on:click="{() => loadGame(game)}" class="pl-4 hover:underline cursor-pointer text-blue-300">{game.id}</span>
        </p>
        <p class="truncate">Game Bounty: {game.bounty && utils.formatEther(game.bounty)}</p>
        <p class="truncate">Player 1: {game.player1}</p>
        <p class="truncate">Player 2: {game.player2}</p>
        {/each}
        {/if}
        <p class="w-full border border-solid-bottom border-gray-300"></p>

        <p class="font-bold">Games you own</p>
        {#if $ownedGames.length}
        {#each $ownedGames as ownedGame}
        <p class="w-full border border-solid-bottom border-gray-300"></p>
        <p class="truncate">
          Game ID:
          <span on:click="{loadGame(ownedGame)}" class="pl-4 cursor-pointer hover:underline text-blue-300">
            {ownedGame.id}
          </span>
        </p>
        <p class="truncate">
          Game Bounty: {ownedGame.bounty && utils.formatEther(ownedGame.bounty)}
          {#if !canAddBounty(ownedGame)}
            <span class="text-xs text-gray-400">Cannot add bounty to this game because the owner is a player.</span>
            {/if}
          {#if canAddBounty(ownedGame)}
          <span on:click="{() => bountyGame = ownedGame}" class="pl-4 cursor-pointer hover:underline text-blue-300">
            Add Bounty
          </span>
          {/if}
        </p>
        <p class="truncate">Player 1: {ownedGame.player1}</p>
        <p class="truncate">Player 2: {ownedGame.player2}</p>
        <p class="truncate">Winner: {ownedGame.winner}</p>
        {/each}
        {/if}
        <p class="w-full border border-solid-bottom border-gray-300"></p>
      </div>

      <div class="w-1/2 px-8">
        Mint a game
        <Input label="Player 1 Address" bind:value="{newPlayer1Address}" />
        <Input label="Player 2 Address" bind:value="{newPlayer2Address}" />

        {#if minting}
          <Spinner label="Minting..." />
        {/if}
        {#if !minting}
        <Button type="primary" on:click="{mint}" disabled="{!validMint()}">
          Mint
        </Button>
        {/if}
      </div>
      {/if}

      {#if typeof $gameId === 'number'}
      <div class="chessboard">

        {#each pieceSpace as row, rowIndex}
        {#each row as square, squareIndex}

          <div
            class="{((rowIndex % 2) + (squareIndex % 8)) % 2 ? 'black' : 'white'} relative"
            on:dragover="{dragOver}"
            on:drop="{dropPiece}"
            on:dragstart="{pickupPiece}"
            on:dragend="{putdownPiece}"
            data-location="{colorTransform(rowIndex, $myColor)},{colorTransform(squareIndex, $myColor)}"
          >
            {@html pieceSpace[colorTransform(rowIndex, $myColor)][colorTransform(squareIndex, $myColor)] }
          </div>

        {/each}
        {/each}

      </div>
      <div class="history">
        {#if $myColor}
        <h3>
          You are playing as <b>{$myColor}</b>
        </h3>
        {/if}

        <h3 class="w-64">Moves</h3>

        <div class="flex items-start">
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
      {/if}
    </div>
    {/if}
  {/if}
</main>

<style>

.btn.btn-connect {
  border: 0;
  line-height: 2.5;
  padding: 0 20px;
  font-size: 1rem;
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  border-radius: 10px;
  background-color: rgba(227, 227, 227, 1);
  background-image: linear-gradient(to top left,
                                    rgba(0, 0, 0, .2),
                                    rgba(0, 0, 0, .2) 30%,
                                    rgba(0, 0, 0, 0));
  box-shadow: inset 2px 2px 3px rgba(255, 255, 255, .6),
              inset -2px -2px 3px rgba(0, 0, 0, .6);
}

.btn.btn-connect:hover {
  background-color: rgba(137, 137, 137, 1);
}

.btn.btn-connect:active {
  box-shadow: inset -2px -2px 3px rgba(255, 255, 255, .6),
              inset 2px 2px 3px rgba(0, 0, 0, .6);
}

.container-center {
  padding: 2rem;
  text-align: center;
}

.chessboard {
  width: 690px;
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

@media (max-width: 700px) {
  .black {
    font-size: 6vw;
  }

  .white {
    font-size: 6vw;
  }
}
@media (min-width: 701px) {
  .black {
    font-size: 50px;
  }

  .white {
    font-size: 50px;
  }
}

.black {
  float: left;
  width: 12.5%;
  height: 0;
  padding-bottom: 12.5%;
  background-color: #999;
  text-align: center;
  display: table-cell;
  vertical-align: middle;
}

.white {
  float: left;
  width: 12.5%;
  height: 0;
  padding-bottom: 12.5%;
  background-color: #fff;
  text-align:center;
  display: table-cell;
  vertical-align:middle;
}

.text-red {
  color: red;
}

</style>