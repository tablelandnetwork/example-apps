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

  let turn = 'white';

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

    turn = turn === 'black' ? 'white' : 'black';

    // Did they win?

    console.log(`Moving ${piece} from ${moveFrom} to ${moveTo}`);

    pieceSpace[moveTo[0]][moveTo[1]] = pieceSpace[moveFrom[0]][moveFrom[1]];
    pieceSpace[moveFrom[0]][moveFrom[1]] = '';
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

  function isValidPhysics(pieceText, from, to) {
    const name = getPieceName(pieceText);
    const color = getPieceColor(pieceText);

    // you can never take your own piece
    const takePiece = pieceSpace[to[0]][to[1]];
    const takeColor = getPieceColor(takePiece);
    if (takeColor === color) return false;

    // piece must be moving
    if (from[0] === to[0] && from[1] === to[1]) return false;

    if (name == 'pawn') {
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
      // ensure the move is only one square
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

</script>

<main>
  <div class="head-info">
    <h3>Current Turn: {turn}</h3>
  </div>
  <div class="chessboard">

    {#each pieceSpace as row, rowIndex}
    {#each row as square, squareIndex}

      <div
        class="{((rowIndex % 2) + (squareIndex % 8)) % 2 ? 'white' : 'black'}"
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
</main>

<style>

.head-info {
  text-align: center;
}

.chessboard {
  width: 640px;
  height: 640px;
  margin: auto;
  border: 25px solid #333;
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