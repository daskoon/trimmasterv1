import type { Results } from '@mediapipe/face_mesh';

const LANDMARKS = {
  JAWLINE: [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454],
  LIP_UPPER: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  LIP_LOWER: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  NOSE_BASE: [164],
  EYE_LEFT: 33,
  EYE_RIGHT: 263
};

export const drawBeardOverlay = (
  ctx: CanvasRenderingContext2D, 
  results: Results, 
  styleName: string = 'commander'
) => {
  if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

  const landmarks = results.multiFaceLandmarks[0];
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const getPt = (index: number) => ({
    x: (landmarks[index]?.x || 0) * width,
    y: (landmarks[index]?.y || 0) * height
  });

  // Calculate face scale (distance between eyes) for dynamic offsets
  const eyeL = getPt(LANDMARKS.EYE_LEFT);
  const eyeR = getPt(LANDMARKS.EYE_RIGHT);
  const faceScale = Math.sqrt(Math.pow(eyeR.x - eyeL.x, 2) + Math.pow(eyeR.y - eyeL.y, 2)) / 100;

  const style = (styleName || 'commander').toLowerCase().replace(/ /g, '');
  const guideColor = '#f59e0b'; 
  const fillStyle = 'rgba(10, 10, 10, 0.4)'; 
  
  ctx.save(); // Isolate styles
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = guideColor;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);

  // --- 1. THE STACHE / MUSTACHE COMPONENT ---
  if (style.includes('stache') || style.includes('commander') || style.includes('goatee')) {
    ctx.beginPath();
    LANDMARKS.LIP_UPPER.forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y - (4 * faceScale)); 
    });
    const nose = getPt(164);
    const mouthRight = getPt(291);
    const mouthLeft = getPt(61);
    ctx.quadraticCurveTo(mouthRight.x, nose.y + (6 * faceScale), nose.x, nose.y + (3 * faceScale));
    ctx.quadraticCurveTo(mouthLeft.x, nose.y + (6 * faceScale), mouthLeft.x, mouthLeft.y - (4 * faceScale));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (style.includes('stache') && !style.includes('commander')) {
    ctx.restore();
    return;
  }

  // --- 2. THE GOATEE ---
  if (style.includes('goatee')) {
    const mouthRight = getPt(291);
    const mouthLeft = getPt(61);
    const chinRight = getPt(148); 
    const chinLeft = getPt(377);  
    
    ctx.beginPath();
    ctx.moveTo(mouthRight.x, mouthRight.y);
    ctx.quadraticCurveTo(mouthRight.x + (5 * faceScale), (mouthRight.y + chinRight.y)/2, chinRight.x, chinRight.y);
    
    // Wider, smoother chin arc
    [148, 176, 149, 150, 152, 379, 378, 400, 377].forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y);
    });

    ctx.lineTo(chinLeft.x, chinLeft.y);
    ctx.quadraticCurveTo(mouthLeft.x - (5 * faceScale), (mouthLeft.y + chinLeft.y)/2, mouthLeft.x, mouthLeft.y);

    [...LANDMARKS.LIP_LOWER].forEach(idx => {
       const p = getPt(idx);
       ctx.lineTo(p.x, p.y + (5 * faceScale));
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return; 
  }

  // --- 3. THE CHIN STRAP ---
  if (style.includes('chinstrap') || style.includes('chin strap')) {
    const sbLeft = getPt(234);
    ctx.beginPath();
    ctx.moveTo(sbLeft.x, sbLeft.y);
    
    // Outer Jawline
    LANDMARKS.JAWLINE.forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y);
    });

    // Inner Jawline (Dynamic offset based on face size)
    const strapWidth = 8 * faceScale;
    [...LANDMARKS.JAWLINE].reverse().forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y - strapWidth); 
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // --- 4. THE COMMANDER ---
  if (style.includes('commander')) {
    const mouthRight = getPt(291);
    const sbRight = getPt(454);
    const mouthLeft = getPt(61);
    const sbLeft = getPt(234);
    
    const cheekOffset = 15 * faceScale;
    const cheekRightMid = { 
      x: (mouthRight.x + sbRight.x) / 2, 
      y: (mouthRight.y + sbRight.y) / 2 - cheekOffset 
    };
    const cheekLeftMid = { 
      x: (mouthLeft.x + sbLeft.x) / 2, 
      y: (mouthLeft.y + sbLeft.y) / 2 - cheekOffset
    };

    ctx.beginPath();
    ctx.moveTo(sbLeft.x, sbLeft.y);
    LANDMARKS.JAWLINE.forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(sbRight.x, sbRight.y);
    ctx.quadraticCurveTo(cheekRightMid.x, cheekRightMid.y, mouthRight.x, mouthRight.y);
    [...LANDMARKS.LIP_LOWER].reverse().forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y + (6 * faceScale)); 
    });
    ctx.quadraticCurveTo(cheekLeftMid.x, cheekLeftMid.y, sbLeft.x, sbLeft.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore(); // Clean up context state
};