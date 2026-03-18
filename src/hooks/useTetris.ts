import { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, Piece, SHAPES, COLORS, PieceType } from '../types';

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export function useTetris() {
  const [board, setBoard] = useState<(string | null)[][]>(createBoard());
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const dropCounterRef = useRef<number>(0);

  const randomPiece = useCallback((): Piece => {
    const types: PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
      shape: SHAPES[type],
      color: COLORS[type],
    };
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createBoard());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setActivePiece(randomPiece());
  }, [randomPiece]);

  const collide = useCallback((piece: Piece, newBoard: (string | null)[][]) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          if (
            !newBoard[y + piece.pos.y] ||
            newBoard[y + piece.pos.y][x + piece.pos.x] !== null ||
            x + piece.pos.x < 0 ||
            x + piece.pos.x >= COLS ||
            y + piece.pos.y >= ROWS
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const rotate = useCallback((matrix: number[][]) => {
    const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotated.map(row => row.reverse());
  }, []);

  const playerRotate = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;
    const clonedPiece = JSON.parse(JSON.stringify(activePiece));
    clonedPiece.shape = rotate(clonedPiece.shape);
    
    // Wall kick
    const pos = clonedPiece.pos.x;
    let offset = 1;
    while (collide(clonedPiece, board)) {
      clonedPiece.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPiece.shape[0].length) {
        clonedPiece.pos.x = pos;
        return;
      }
    }
    setActivePiece(clonedPiece);
  }, [activePiece, board, collide, gameOver, isPaused, rotate]);

  const playerMove = useCallback((dir: number) => {
    if (!activePiece || gameOver || isPaused) return;
    const newPiece = { ...activePiece, pos: { ...activePiece.pos, x: activePiece.pos.x + dir } };
    if (!collide(newPiece, board)) {
      setActivePiece(newPiece);
    }
  }, [activePiece, board, collide, gameOver, isPaused]);

  const drop = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;
    const newPiece = { ...activePiece, pos: { ...activePiece.pos, y: activePiece.pos.y + 1 } };
    
    if (!collide(newPiece, board)) {
      setActivePiece(newPiece);
    } else {
      // Merge
      const newBoard = [...board.map(row => [...row])];
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + activePiece.pos.y][x + activePiece.pos.x] = activePiece.color;
          }
        });
      });

      // Clear lines
      let linesCleared = 0;
      const clearedBoard = newBoard.reduce((acc, row) => {
        if (row.every(cell => cell !== null)) {
          linesCleared++;
          acc.unshift(Array(COLS).fill(null));
          return acc;
        }
        acc.push(row);
        return acc;
      }, [] as (string | null)[][]);

      if (linesCleared > 0) {
        setScore(prev => prev + linesCleared * 100 * level);
        setLines(prev => prev + linesCleared);
        if (linesCleared + lines >= level * 10) {
          setLevel(prev => prev + 1);
        }
        // Trigger explosion effect (handled in component)
      }

      setBoard(clearedBoard);
      const nextPiece = randomPiece();
      if (collide(nextPiece, clearedBoard)) {
        setGameOver(true);
      } else {
        setActivePiece(nextPiece);
      }
    }
    dropCounterRef.current = 0;
  }, [activePiece, board, collide, gameOver, isPaused, level, lines, randomPiece]);

  const hardDrop = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;
    let newPos = activePiece.pos.y;
    while (!collide({ ...activePiece, pos: { ...activePiece.pos, y: newPos + 1 } }, board)) {
      newPos++;
    }
    const finalPiece = { ...activePiece, pos: { ...activePiece.pos, y: newPos } };
    
    // Merge logic repeated for hard drop
    const newBoard = [...board.map(row => [...row])];
    finalPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[y + finalPiece.pos.y][x + finalPiece.pos.x] = finalPiece.color;
        }
      });
    });

    let linesCleared = 0;
    const clearedBoard = newBoard.reduce((acc, row) => {
      if (row.every(cell => cell !== null)) {
        linesCleared++;
        acc.unshift(Array(COLS).fill(null));
        return acc;
      }
      acc.push(row);
      return acc;
    }, [] as (string | null)[][]);

    if (linesCleared > 0) {
      setScore(prev => prev + linesCleared * 100 * level);
      setLines(prev => prev + linesCleared);
    }

    setBoard(clearedBoard);
    const nextPiece = randomPiece();
    if (collide(nextPiece, clearedBoard)) {
      setGameOver(true);
    } else {
      setActivePiece(nextPiece);
    }
  }, [activePiece, board, collide, gameOver, isPaused, level, randomPiece]);

  useEffect(() => {
    const update = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPaused && !gameOver) {
        dropCounterRef.current += deltaTime;
        const dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        if (dropCounterRef.current > dropInterval) {
          drop();
        }
      }
      requestRef.current = requestAnimationFrame(update);
    };

    // We only start the loop if the game is active
    if (activePiece) {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [drop, gameOver, isPaused, level, activePiece]);

  return {
    board,
    activePiece,
    score,
    level,
    lines,
    gameOver,
    isPaused,
    setIsPaused,
    playerMove,
    playerRotate,
    drop,
    hardDrop,
    resetGame,
  };
}
