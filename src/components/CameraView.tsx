import React, { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { setupFaceMesh } from '../services/faceMesh';
import { drawBeardOverlay } from '../services/beardRenderer';
import type { Results } from '@mediapipe/face_mesh';

interface CameraViewProps {
  mode: 'capture' | 'guide';
  overlayImage?: string;
  styleName?: string;
  zoom?: number;
  mirrored?: boolean;
  onCapture?: (image: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  styleName = 'The Commander',
  zoom = 1.0,
  mirrored = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refs so the per-frame callback always sees the latest values
  const zoomRef = useRef(zoom);
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => { panOffsetRef.current = panOffset; }, [panOffset]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ ...panOffset });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    // Invert X when mirrored so dragging feels natural in mirror mode
    const sign = mirrored ? -1 : 1;
    setPanOffset({
      x: panStart.x + dx * sign,
      y: panStart.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    setIsDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  useEffect(() => {
    let cameraController: { start: () => Promise<void>; stop: () => void } | null = null;

    const init = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        setIsLoading(true);
        setError(null);
        setPanOffset({ x: 0, y: 0 });

        const isPortrait = window.innerHeight > window.innerWidth;
        const idealWidth = isPortrait ? 720 : 1280;
        const idealHeight = isPortrait ? 1280 : 720;

        canvasRef.current.width = idealWidth;
        canvasRef.current.height = idealHeight;

        const { start, stop } = setupFaceMesh(
          videoRef.current,
          (results: Results) => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            setIsLoading(false);

            const width = canvasRef.current.width;
            const height = canvasRef.current.height;
            const cx = width / 2;
            const cy = height / 2;

            ctx.save();
            ctx.clearRect(0, 0, width, height);

            // Apply zoom (centered) and pan offset
            const currentZoom = zoomRef.current;
            const currentPan = panOffsetRef.current;

            ctx.translate(cx + currentPan.x, cy + currentPan.y);
            ctx.scale(currentZoom, currentZoom);
            ctx.translate(-cx, -cy);

            ctx.drawImage(results.image, 0, 0, width, height);
            drawBeardOverlay(ctx, results, styleName || 'commander');
            ctx.restore();
          },
          idealWidth,
          idealHeight
        );

        cameraController = { start, stop };
        await start();

      } catch (err: any) {
        console.error("FaceMesh Error:", err);
        setError(`System Error: ${err.message || err}`);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (cameraController) cameraController.stop();
    };
  }, [styleName]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <video ref={videoRef} className="hidden" playsInline muted />

      {/*
          FINAL SQUISH FIX:
          We use scale(-1, 1) and lock the width/height to 100vw/100vh
          to ensure it never collapses into a vertical line.
      */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          width: '100vw',
          height: '100vh',
          transform: mirrored ? 'scale(-1, 1)' : 'scale(1, 1)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
      </div>

      {/* OVERLAYS */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        {isLoading && !error && (
          <div className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-8 rounded-3xl">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <p className="text-white font-bold tracking-widest uppercase text-sm">Calibrating...</p>
          </div>
        )}
      </div>
    </div>
  );
};
