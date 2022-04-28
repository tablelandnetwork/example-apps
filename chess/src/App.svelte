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

  function pickupPiece(eve) {
    console.log(`pickupPiece ${eve.target.dataset.piece} from ${eve.target.parentElement.dataset.location}`);
    eve.dataTransfer.setData('piece', eve.target.dataset.piece);
    eve.dataTransfer.setData('location', eve.target.parentElement.dataset.location);
    eve.target.style['background-color'] = 'yellow';
  }

  function putdownPiece(eve) {
    console.log('putdownPiece');
    eve.target.style['background-color'] = '';
  }

  function dragOver(eve) {
   // this listener is required to enable dropping
   eve.preventDefault();
  }

  function dropPiece(eve) {
    eve.preventDefault();
    const moveTo = eve.currentTarget.dataset.location.split(',');
    const moveFrom = eve.dataTransfer.getData('location').split(',');
    const piece = eve.dataTransfer.getData('piece');

    console.log(`Moving ${piece} from ${moveFrom} to ${moveTo}`);

    pieceSpace[moveTo[0]][moveTo[1]] = pieceSpace[moveFrom[0]][moveFrom[1]];
    pieceSpace[moveFrom[0]][moveFrom[1]] = '';
  }
</script>

<main>
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
  font-size:50px;
  text-align:center;
  display: table-cell;
  vertical-align:middle;
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