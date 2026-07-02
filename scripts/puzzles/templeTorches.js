"use strict";

// Temple Torches (Lights-Out 3x3) puzzle helpers.
// Pure operations over a 3x3 boolean grid. No dependency on gameState.
(function (global) {
  const inBounds = (r, c) => r >= 0 && r < 3 && c >= 0 && c < 3;

  function clone(grid) {
    return grid.map(row => row.slice());
  }

  function flipAt(grid, r, c) {
    if (!inBounds(r, c)) return;
    grid[r][c] = !grid[r][c];
  }

  // Returns a new grid after applying the move at (r,c): flip self + orthogonal neighbors
  function applyMove(grid, r, c) {
    const g = clone(grid);
    flipAt(g, r, c);
    flipAt(g, r - 1, c);
    flipAt(g, r + 1, c);
    flipAt(g, r, c - 1);
    flipAt(g, r, c + 1);
    return g;
  }

  function isSolved(grid) {
    return grid.every(row => row.every(Boolean));
  }

  function randomize() {
    let grid = [
      [false, false, false],
      [false, false, false],
      [false, false, false]
    ];
    // 5–12 random moves from all-off yields a solvable configuration
    const moves = Math.floor(Math.random() * 8) + 5; // 5..12
    for (let i = 0; i < moves; i++) {
      const r = Math.floor(Math.random() * 3);
      const c = Math.floor(Math.random() * 3);
      grid = applyMove(grid, r, c);
    }
    // Avoid trivial all-off or all-on by nudging; fallback to known nontrivial state
    const lit = () => grid.flat().filter(Boolean).length;
    if (lit() === 0 || lit() === 9) {
      const r = Math.floor(Math.random() * 3);
      const c = Math.floor(Math.random() * 3);
      grid = applyMove(grid, r, c);
      if (lit() === 0 || lit() === 9) {
        grid = [
          [true, false, false],
          [false, false, false],
          [false, false, false]
        ];
      }
    }
    return grid;
  }

  global.templeTorches = { applyMove, isSolved, randomize };
})(window);
