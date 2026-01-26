import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { setupFaceMesh } from '../services/faceMesh';
import { drawBeardOverlay } from '../services/beardRenderer';
import type { Results } from '@mediapipe/face_mesh';

interface CameraViewProps {
  mode: 'capture' | 'guide';
  overlayImage?: string; 
  styleName?: string;    
  opacity?: number;
  mirrored?: boolean;
  onCapture?: (image: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ 
  styleName = 'The Commander',
  opacity = 0.8,
  mirrored = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cameraController: { start: () => Promise<void>; stop: () => void } | null = null;

    const init = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

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

            ctx.save();
            ctx.clearRect(0, 0, width, height);

            if (mirrored) {
              ctx.translate(width, 0);
              ctx.scale(-1, 1);
            }
            ctx.drawImage(results.image, 0, 0, width, height);

            ctx.globalAlpha = opacity;
            drawBeardOverlay(ctx, results, styleName || 'commander');
            ctx.globalAlpha = 1.0;

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
  }, [styleName, opacity, mirrored]); 

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="hidden" playsInline muted />

      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
          <p className="text-white font-bold tracking-widest uppercase">Calibrating Guide...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-900 z-50">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white text-lg font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};
