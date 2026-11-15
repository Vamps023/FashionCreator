import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side: 'left' | 'right';
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 480,
  side,
  className = ''
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(defaultWidth);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = side === 'left' ? startWidthRef.current + delta : startWidthRef.current - delta;
      setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, side, minWidth, maxWidth]);

  return (
    <div
      style={{ width: `${width}px` }}
      className={`relative flex-shrink-0 flex flex-col h-full ${className}`}
    >
      {children}

      {/* Resize Handle */}
      <div
        onMouseDown={onMouseDown}
        className={`absolute top-0 bottom-0 w-2 cursor-col-resize z-30 transition-colors ${
          side === 'left' ? '-right-1' : '-left-1'
        } ${isDragging ? 'bg-[var(--accent)]' : 'hover:bg-[var(--accent)]/40'}`}
        title="Drag to resize panel"
      />
    </div>
  );
};
