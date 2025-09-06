import { useState, useCallback } from 'react';
import { Position } from '../types/chess';

export const useDragAndDrop = (
  onMove: (from: Position, to: Position) => void,
  isValidMove: (from: Position, to: Position) => boolean
) => {
  const [draggedPiece, setDraggedPiece] = useState<Position | null>(null);
  const [dragOverSquare, setDragOverSquare] = useState<Position | null>(null);

  const handleDragStart = useCallback((position: Position) => {
    setDraggedPiece(position);
  }, []);

  const handleDragOver = useCallback((position: Position) => {
    setDragOverSquare(position);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedPiece && dragOverSquare && isValidMove(draggedPiece, dragOverSquare)) {
      onMove(draggedPiece, dragOverSquare);
    }
    setDraggedPiece(null);
    setDragOverSquare(null);
  }, [draggedPiece, dragOverSquare, onMove, isValidMove]);

  return {
    draggedPiece,
    dragOverSquare,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};
