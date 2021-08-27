//Function IIFE (Immediately-Invoked Function Expression)
(function () {
  "use strict";
  const canvas = document.getElementById("tetris");
  const ctx = canvas.getContext("2d");
  ctx.scale(20, 20);

  //Function that creates matrix
  let makeMatrix = (w, h) => {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  };

 
  let makePiece = (type) => {
    if (type === "t") {
      return [
        [0, 0, 0],
        [5, 5, 5],
        [0, 5, 0],
      ];
    } else if (type === "o") {
      return [
        [7, 7],
        [7, 7],
      ];
    } else if (type === "l") {
      return [
        [0, 4, 0],
        [0, 4, 0],
        [0, 4, 4],
      ];
    } else if (type === "j") {
      return [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ];
    } else if (type === "i") {
      return [
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
      ];
    } else if (type === "s") {
      return [
        [6, 6, 0],
        [0, 6, 6],
        [0, 0, 0],
      ];
    }
  };

  // Counting the scores
  let points = () => {
    let rowCount = 1;
    
    outer: for (let y = area.length - 1; y > 0; --y) {
      for(let x=0;x<area[y].length;++x){
				if(area[y][x]===0){
					continue outer;
				}
			}
    }
   
    const row = area.splice(y, 1)[0].fill(0);
    area.unshift(row);
    ++y;
    player.score += rowCount * 100;
    rowCount *= 2;
  };

  //Collision function
  //matrix, offset
  let collide = (area, player) => {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 && (area[y + o.y] && area[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  //Drawing matrix function
  let drawMatrix = function (matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          let imgTag = document.createElement("IMG");
          imgTag.src = colors[value];
          ctx.drawImage(imgTag, x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  };

  // function that sets the position of the pieces on canvas
  let merge = function (area, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          area[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  };

  // Rotation function
  let rotate = function (matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
  };
  // Reset game
  let playerReset = function () {
    const pieces = "ijlostz";
    player.matrix = makePiece(
      pieces[Math.floor(Math.random() * pieces.length)]
    );
    player.pos.y = 0;
    player.pos.x =
      Math.floor(area[0].length / 2) - Math.floor(player.matrix.length / 2);
    if (collide(area, player)) {
      area.forEach(row => row.fill(0));
      player.score = 0;
      gameRun = false;
    }
  };

  //Falling speed up
  let playerDrop = function () {
    player.pos.y++;
    if (collide(area, player)) {
      player.pos.y--;
      merge(area, player);
      points();
      playerReset();
      updateScore();
    }
  };

  //Sides movement
  let playerMove = function (dir) {
    player.pos.x += dir;
    if (collide(area, player)) {
      player.pos.x -= dir;
    }
  };

  //Rotating pieces
  let playerRotate = function (dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(area, player)) {
      player.pos.x += offset;
      offset =-(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  };

  //Drawing the pieces, matrix, score
  let draw = function () {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateScore();
    drawMatrix(area, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
  };

  //Vars
  let dropInter = 100;
  let time = 0;

  let update = function () {
    time++;
    if (time >= dropInter) {
      playerDrop();
      time = 0;
    }
    draw();
  };

  //Update score
  let updateScore = function () {
    ctx.font = "bold 1px Comic Sans MS";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + player.score, 0.2, 0);
  };

  //Game over
  let gameOver = function () {
    clearInterval(gameLoop);
    ctx.font = "2px Comic Sans MS";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", canvas.width / 20 / 2, canvas.width / 20 / 2);
    document.getElementById("startGame").disabled = false;
  };

  //Colors
  const colors = [
    null,
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzlEQkJBRTBGNjM2MTFFQkI5QTc5Mjc1QzFFQTlGMEUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzlEQkJBRTFGNjM2MTFFQkI5QTc5Mjc1QzFFQTlGMEUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDOURCQkFERUY2MzYxMUVCQjlBNzkyNzVDMUVBOUYwRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDOURCQkFERkY2MzYxMUVCQjlBNzkyNzVDMUVBOUYwRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmCpyMUAAABrSURBVHja7M8BAQAwBAAwHk0mwUV4D7YGy+qJS14cIywsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsvNsXYAD+0wJGm34bTAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0U4QTUxRkJGNjM2MTFFQkIyNUU4QjAwN0VGODJBQjgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0U4QTUxRkNGNjM2MTFFQkIyNUU4QjAwN0VGODJBQjgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDRThBNTFGOUY2MzYxMUVCQjI1RThCMDA3RUY4MkFCOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDRThBNTFGQUY2MzYxMUVCQjI1RThCMDA3RUY4MkFCOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PosnS2YAAABsSURBVHja7M8BAQAwBAAwHkP/ZDII8B5sDZZdE5e8OEZYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWHi3L8AAxUUCkDE8zBQAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDRFMTdCMzZGNjM2MTFFQjk5OTc5QzY0MTI3OUIxMTkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDRFMTdCMzdGNjM2MTFFQjk5OTc5QzY0MTI3OUIxMTkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENEUxN0IzNEY2MzYxMUVCOTk5NzlDNjQxMjc5QjExOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENEUxN0IzNUY2MzYxMUVCOTk5NzlDNjQxMjc5QjExOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pp4wz1QAAABsSURBVHja7M8BEQBABAAw/vSPIJ4c34OtwXK64pIXxwgLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLC+/2BRgALMcCKGvTUjgAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REFGMjk3REZGNjM2MTFFQkE4MzJEQ0MzNDBBMEIzQTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REFGMjk3RTBGNjM2MTFFQkE4MzJEQ0MzNDBBMEIzQTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEQUYyOTdEREY2MzYxMUVCQTgzMkRDQzM0MEEwQjNBMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEQUYyOTdERUY2MzYxMUVCQTgzMkRDQzM0MEEwQjNBMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgUza98AAABrSURBVHja7M8BEQBABAAwPqH+XZzvwdZgOV1xyYtjhIWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFd/sCDADXowLsQAwHXgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REZBQjVGMjBGNjM2MTFFQkFERERENEQ2NjI5N0U1RTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REZBQjVGMjFGNjM2MTFFQkFERERENEQ2NjI5N0U1RTYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpERkFCNUYxRUY2MzYxMUVCQUREREQ0RDY2Mjk3RTVFNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpERkFCNUYxRkY2MzYxMUVCQUREREQ0RDY2Mjk3RTVFNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrByhQ4AAABrSURBVHja7M8BAQAwBAAw3kQxxZV5D7YGy56KS14cIywsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsvNsXYACjTAH6Ff2BggAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTRFQkEzQTNGNjM2MTFFQkEyODM4NzRCODk0QkY4NTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTRFQkEzQTRGNjM2MTFFQkEyODM4NzRCODk0QkY4NTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNEVCQTNBMUY2MzYxMUVCQTI4Mzg3NEI4OTRCRjg1MiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNEVCQTNBMkY2MzYxMUVCQTI4Mzg3NEI4OTRCRjg1MiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjLLdc8AAABsSURBVHja7M9BAQBABAAwrok2+n+VuR5sDZbTFZe8OEZYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWHi3L8AAKrsB5DQn7dIAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MEM2MEJBNkRGNjM3MTFFQjkxRTBGMTE0MjVBMjUyRjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MEM2MEJBNkVGNjM3MTFFQjkxRTBGMTE0MjVBMjUyRjAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowQzYwQkE2QkY2MzcxMUVCOTFFMEYxMTQyNUEyNTJGMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowQzYwQkE2Q0Y2MzcxMUVCOTFFMEYxMTQyNUEyNTJGMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhgKKoAAAABsSURBVHja7M9BEQAwCAAgXUj7t/D8rYdCA7J64pIXxwgLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLC+/2BRgAEm4C5k5hsh4AAAAASUVORK5CYII=",
  ];

  const area = makeMatrix(12, 30);
  const player = {
    pos: {
      x: 0,
      y: 0,
    },
    matrix: null,
    score: 0,
  };

  //var and functions being called
  const move = 1;
  let gameLoop;
  let gameRun = false;
  playerReset();
  draw();
  gameOver();

  //Pieces movement
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 37) {
      playerMove(-move);
    } else if (e.keyCode === 39) {
      playerMove(+move);
    } else if (e.keyCode === 40) {
      if (gameRun) {
        playerDrop();
      }
    } else if (e.keyCode === 38) {
      playerRotate(-move);
    }
  });

  //Stating game when clicking "start"
  document.getElementById("startGame").onclick = function () {
    gameRun = true;
    playerReset();
    gameLoop = setInterval(function () {
      if (gameRun) {
        update();
      } else {
        gameOver();
      }
    }, 10);
    this.disabled = true;
  };
})();
