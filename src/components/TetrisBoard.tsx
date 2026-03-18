import React, { useEffect, useRef } from 'react';
import { COLS, ROWS, BLOCK_SIZE, Piece } from '../types';

interface Props {
  board: (string | null)[][];
  activePiece: Piece | null;
  isOpponent?: boolean;
}

export const TetrisBoard: React.FC<Props> = ({ board, activePiece, isOpponent = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(canvas.width, y * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw board
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          drawBlock(ctx, x, y, color);
        }
      });
    });

    // Draw active piece
    if (activePiece) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            drawBlock(ctx, x + activePiece.pos.x, y + activePiece.pos.y, activePiece.color);
          }
        });
      });
    }
  }, [board, activePiece]);

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 4);
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, 4, BLOCK_SIZE - 2);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + BLOCK_SIZE - 5, BLOCK_SIZE - 2, 4);
    ctx.fillRect(x * BLOCK_SIZE + BLOCK_SIZE - 5, y * BLOCK_SIZE + 1, 4, BLOCK_SIZE - 2);
  };

  return (
    <div className={`relative border-4 ${isOpponent ? 'border-red-500/50 scale-75' : 'border-[#006633]'} rounded-lg overflow-hidden shadow-2xl`}>
      <canvas
        ref={canvasRef}
        width={COLS * BLOCK_SIZE}
        height={ROWS * BLOCK_SIZE}
        className="block"
      />
      {isOpponent && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1 rounded font-bold uppercase">
          Opponent
        </div>
      )}
    </div>
  );
};
