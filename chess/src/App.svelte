<script lang="ts">
  const pieceSpace = [
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

  let gameHistory = [];

  let turn = 'white';
  let whiteCanCastleLong = true;
  let whiteCanCastleShort = true;
  let blackCanCastleLong = true;
  let blackCanCastleShort = true;

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
    const moveTo = eve.currentTarget.dataset.location.split(',').map(str => parseInt(str, 10));
    const moveFrom = eve.dataTransfer.getData('location').split(',').map(str => parseInt(str, 10));
    const piece = eve.dataTransfer.getData('piece');

    // something went wrong in the event cycle, so we bail
    if (!(moveTo && moveFrom && piece)) return;

    console.log(`Trying to move ${piece} from ${moveFrom} to ${moveTo}`);
    // TODO: enforce rules of the game!

    const validMove = isMoveAllowed(moveFrom, moveTo);

    if (!validMove) return;

    // TODO: Did they win?
    //if (isCheckmate()) ...

    doMove(piece, moveFrom, moveTo);

    turn = turn === 'black' ? 'white' : 'black';
  }

  function doMove(piece, from, to) {

    console.log(`Moving ${piece} from ${from} to ${to}`);

    if (isEnPassant(from, to)) {
      const color = getPieceColor(piece);
      if (color === 'black') pieceSpace[to[0] - 1][to[1]] = '';
      if (color === 'white') pieceSpace[to[0] + 1][to[1]] = '';
    }

    gameHistory = gameHistory.concat([{
      from: from,
      to: to,
      piece: piece,
      notation: getMoveNotation(from, to)
    }]);

    pieceSpace[to[0]][to[1]] = pieceSpace[from[0]][from[1]];
    pieceSpace[from[0]][from[1]] = '';

    const pieceName = getPieceName(piece)
    if (isCastle(pieceName, from, to)) {
      // also move the second piece in the castling

      // player moved left rook
      if (from[1] === 0) {
        pieceSpace[from[0]][2] = pieceSpace[from[0]][4];
        pieceSpace[from[0]][4] = '';
      }

      // player moved king to the left
      if (from[1] === 4 && to[1] === 2) {
        pieceSpace[from[0]][3] = pieceSpace[from[0]][0];
        pieceSpace[from[0]][0] = '';
      }
      // player moved king to the right
      if (from[1] === 4 && to[1] === 6) {
        pieceSpace[from[0]][5] = pieceSpace[from[0]][7];
        pieceSpace[from[0]][7] = '';
      }

      // player moved right rook
      if (from[1] === 7) {
        pieceSpace[from[0]][6] = pieceSpace[from[0]][4];
        pieceSpace[from[0]][4] = '';
      }
    }

    const color = getPieceColor(piece);

    // track if castling is still valid
    if (pieceName === 'rook') {
      const rookNumber = piece.match('1') ? 1 : 2;
      if (color === 'white' && rookNumber === 1) {
        whiteCanCastleLong = false;
      } else if (color === 'white' && rookNumber === 2) {
        whiteCanCastleShort = false;
      } else if (color === 'black' && rookNumber === 1) {
        blackCanCastleLong = false;
      } else if (color === 'black' && rookNumber === 2) {
        blackCanCastleShort = false;
      }
    } else if (pieceName === 'king') {
      if (color === 'white') {
        whiteCanCastleLong = false;
        whiteCanCastleShort = false;
      } else if (color === 'black') {
        blackCanCastleLong = false;
        blackCanCastleShort = false;
      }
    }
  }

  // are they allowed to make the move
  function isMoveAllowed(from, to) {
    const pieceText = pieceSpace[from[0]][from[1]];

    // is it their turn
    if (getPieceColor(pieceText) !== turn) return false;

    // is the movement allowed for the piece
    if (!isValidPhysics(pieceText, from, to)) return false;

    return true;
  }

  function getPieceName(text) {
    if (text.match('pawn')) return 'pawn';
    if (text.match('rook')) return 'rook';
    if (text.match('knight')) return 'knight';
    if (text.match('bishop')) return 'bishop';
    if (text.match('queen')) return 'queen';
    if (text.match('king')) return 'king';
  }

  function getPieceColor(text) {
    if (text.match('white')) return 'white';
    if (text.match('black')) return 'black';

    return '';
  }

  function getMoveNotation(from, to) {
    const fromSquare = rowMap[from[0]] + colMap[from[1]];
    const toSquare = rowMap[to[0]] + colMap[to[1]];

    // Move hasn't happened yet
    const piece = pieceMap[getPieceName(pieceSpace[from[0]][from[1]])];
    const capture = !!pieceSpace[to[0]][to[1]] || isEnPassant(from, to);

    return `${piece}${fromSquare}${capture ? 'x' : '-'}${toSquare}`;
  }

  function isValidPhysics(pieceText, from, to) {
    const name = getPieceName(pieceText);
    const color = getPieceColor(pieceText);

    // you can never take your own piece
    const takePiece = pieceSpace[to[0]][to[1]];
    const takeColor = getPieceColor(takePiece);
    if (takeColor === color) return false;

    // piece must be moving
    if (from[0] === to[0] && from[1] === to[1]) return false;

    if (isCastle(name, from, to)) return canCastle(pieceText, from, to);

    if (name == 'pawn') {
      // check for en passant
      if (isEnPassant(from, to)) return true;
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

        if (!pathClear(from, to)) return false;
      }

      return true;
    }
    if (name == 'rook') {
      // either row has to stay the same, or col has to stay the same
      if (from[1] !== to[1] && from[0] !== to[0]) return false;

      if (!pathClear(from, to)) return false;
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
      if (!pathClear(from, to)) return false;

      return true;
    }
    if (name == 'queen') {
      // up/down, left/right, or diagonal only
      if (from[1] !== to[1] && from[0] !== to[0] && Math.abs(from[1] - to[1]) !== Math.abs(from[0] - to[0])) return false;
      if (!pathClear(from, to)) return false;

      return true;
    }
    if (name == 'king') {
      // ensure the move is only one square, NOTE: we already checked if this is a castling
      if (Math.abs(from[1] - to[1]) > 1 || Math.abs(from[0] - to[0]) > 1) return false;
      return true;
    }
  }

  function pathClear(from, to) {
    // piece must be moving
    if (from[0] === to[0] && from[1] === to[1]) return false;

    // path can only be up/down or diagonal
    if (from[0] === to[0]) { // side to side
      const colInc = from[1] < to[1] ? 1 : -1;

      const currentRow = from[0]
      let currentCol = from[1] + colInc;
      while (currentCol !== to[1] && currentCol > -1 && currentCol < 8) {
        if (pieceSpace[currentRow][currentCol]) return false;

        currentCol += colInc;
      }
      return true;
    }
    if (from[1] === to[1]) { // up or down
      const rowInc = from[0] < to[0] ? 1 : -1;

      let currentRow = from[0] + rowInc;
      const currentCol = from[1];
      while (currentRow !== to[0] && currentRow > -1 && currentRow < 8) {
        if (pieceSpace[currentRow][currentCol]) return false;

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
        if (pieceSpace[currentRow][currentCol]) return false;

        currentRow += rowInc;
        currentCol += colInc;
      }
      return true;
    }

    return false;
  }

  // TODO: need a way to indicate if either color is in check

  // TODO: need a way to deal with pawns making it to the back line

  function isCastle(pieceName, from, to) {
    if (pieceName !== 'rook' && pieceName !== 'king') return false;

    if (pieceName === 'rook') {
      if (from[0] === 7 && from[1] === 0 && to[0] === 7 && to[1] === 3) return true;
      if (from[0] === 7 && from[1] === 7 && to[0] === 7 && to[1] === 5) return true;
      if (from[0] === 0 && from[1] === 0 && to[0] === 0 && to[1] === 3) return true;
      if (from[0] === 0 && from[1] === 7 && to[0] === 0 && to[1] === 5) return true;
    }
    if (pieceName === 'king') {
      if (from[0] === 0 && from[1] === 4 && ((to[0] === 0 && to[1] === 2) || (to[0] === 0 && to[1] === 6))) return true;
      if (from[0] === 7 && from[1] === 4 && ((to[0] === 7 && to[1] === 2) || (to[0] === 7 && to[1] === 6))) return true;
    }
  }
  function canCastle(pieceText, from, to) {
    // TODO: Need to ensure they are not castling through check
    const pieceName = getPieceName(pieceText)
    const color = getPieceColor(pieceText);

    if (!pathClear(from, to)) return false;

    // basic approach of just checking every possible castle move and if it's still allowed
    if (pieceName === 'rook') {
      const rookNumber = pieceText.match('1') ? 1 : 2;
      if (color === 'white' && rookNumber === 1 && whiteCanCastleLong) return true;
      if (color === 'white' && rookNumber === 2 && whiteCanCastleShort) return true;
      if (color === 'black' && rookNumber === 1 && blackCanCastleLong) return true;
      if (color === 'black' && rookNumber === 2 && blackCanCastleShort) return true;
    }
    if (pieceName === 'king') {
      const big = to[1] === 2;
      if (color === 'white' && big && whiteCanCastleLong) return true;
      if (color === 'white' && !big && whiteCanCastleShort) return true;

      if (color === 'black' && big && blackCanCastleLong) return true;
      if (color === 'black' && !big && blackCanCastleShort) return true;
    }

    return false;
  }

  // this will indicate if the (from, to) move is allowed because of en passant
  function isEnPassant(from, to) {
    if (getPieceName(pieceSpace[from[0]][from[1]]) !== 'pawn') return false;
    // look through history and decide
    const lastMove = gameHistory[gameHistory.length - 1];
    if (!lastMove) return false;

    if (getPieceName(lastMove.piece) !== 'pawn') return false;
    const pawnColor = getPieceColor(lastMove.piece);

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
      <h3>Current Turn: {turn}</h3>
      <h3>Moves</h3>
      <ol>
      {#each gameHistory as move}
        <li>{move.notation}</li>
      {/each}
      </ol>
    </div>
  </div>
</main>

<style>

.head-info {
  text-align: center;
}

.flex-container {
  display: flex;
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

</style>