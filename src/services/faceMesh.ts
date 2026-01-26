// We are using Global Scripts from index.html to avoid Vite/Wasm bundling issues
// This is the "Dumb but Bulletproof" method.

export const setupFaceMesh = (
  videoElement: HTMLVideoElement,
  onResults: (results: any) => void,
  width: number,
  height: number
): { start: () => Promise<void>; stop: () => void; faceMesh: any } => {
  
  // Access globals loaded via <script> tags
  const FaceMesh = (window as any).FaceMesh;
  const Camera = (window as any).Camera;

  if (!FaceMesh || !Camera) {
    throw new Error("MediaPipe globals not loaded. Check index.html");
  }

  const faceMesh = new FaceMesh({
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    },
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      if (videoElement.readyState >= 2) {
        await faceMesh.send({ image: videoElement });
      }
    },
    width: width,
    height: height,
  });

  return {
    start: async () => {
      await camera.start();
    },
    stop: () => {
      camera.stop();
      faceMesh.close();
    },
    faceMesh,
  };
};
