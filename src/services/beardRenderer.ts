import { Results } from '@mediapipe/face_mesh';

// Key Landmark Indices
const LANDMARKS = {
  JAWLINE: [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454],
  LIP_UPPER: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  LIP_LOWER: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  NOSE_BASE: [164],
};

export const drawBeardOverlay = (
  ctx: CanvasRenderingContext2D, 
  results: Results, 
  styleName: string
) => {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

  const landmarks = results.multiFaceLandmarks[0];
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const getPt = (index: number) => ({
    x: landmarks[index].x * width,
    y: landmarks[index].y * height
  });

  const style = styleName.toLowerCase().replace(/ /g, '');
  
  // Common Styles
  const guideColor = '#f59e0b'; // Amber Laser
  const fillStyle = 'rgba(10, 10, 10, 0.4)'; // Dark Semi-Transparent
  
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = guideColor;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);

  // --- 1. THE STACHE (Mustache Only) ---
  if (style.includes('stache') || style.includes('commander') || style.includes('goatee')) {
    ctx.beginPath();
    
    // Top Lip Line
    LANDMARKS.LIP_UPPER.forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y - 8); // Offset above lip
    });
    
    // Connect to Nose
    const nose = getPt(164);
    const mouthRight = getPt(291);
    const mouthLeft = getPt(61);
    
    // Smooth Curve to Nose
    ctx.quadraticCurveTo(mouthRight.x, nose.y + 12, nose.x, nose.y + 6);
    ctx.quadraticCurveTo(mouthLeft.x, nose.y + 12, mouthLeft.x, mouthLeft.y - 8);
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // If "The Stache" is selected, we stop here.
  if (style.includes('stache') && !style.includes('commander')) return;


  // --- 2. THE GOATEE ---
  if (style.includes('goatee')) {
    // Goatee Logic: Connect Mouth Corners to Chin Width
    const mouthRight = getPt(291);
    const mouthLeft = getPt(61);
    const chinRight = getPt(148); // Right chin corner
    const chinLeft = getPt(377);  // Left chin corner
    const chinBottom = getPt(152);

    ctx.beginPath();
    
    // Start Right Mouth Corner
    ctx.moveTo(mouthRight.x, mouthRight.y);
    
    // Curve down to Right Chin
    ctx.quadraticCurveTo(mouthRight.x + 10, (mouthRight.y + chinRight.y)/2, chinRight.x, chinRight.y);
    
    // Trace Bottom Chin
    // (We iterate through a subset of jawline for the chin bottom)
    const chinLandmarks = [148, 152, 377]; // Simplified chin arc
    chinLandmarks.forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y);
    });

    // Curve up to Left Mouth Corner
    ctx.lineTo(chinLeft.x, chinLeft.y);
    ctx.quadraticCurveTo(mouthLeft.x - 10, (mouthLeft.y + chinLeft.y)/2, mouthLeft.x, mouthLeft.y);

    // Inner Loop: Under Lip Gap
    [...LANDMARKS.LIP_LOWER].forEach(idx => {
       const p = getPt(idx);
       ctx.lineTo(p.x, p.y + 10);
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return; // Done for Goatee
  }


  // --- 3. THE CHIN STRAP ---
  if (style.includes('chinstrap') || style.includes('chin strap')) {
    const sbLeft = getPt(234);
    const sbRight = getPt(454);

    ctx.beginPath();
    ctx.moveTo(sbLeft.x, sbLeft.y);

    // Jawline (Outer)
    LANDMARKS.JAWLINE.forEach(idx => {
      const p = getPt(idx);
      ctx.lineTo(p.x, p.y);
    });

    // Jawline (Inner/Upper - The "Strap" width)
    // We reverse the jawline and offset Y upwards
    [...LANDMARKS.JAWLINE].reverse().forEach(idx => {
      const p = getPt(idx);
      // Offset logic: Move towards the nose/center to create thickness
      // Simple offset: just Y-15 for a thin line
      ctx.lineTo(p.x, p.y - 15); 
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return; // Done for Laser Line
  }


  // --- 4. THE COMMANDER (Full Beard) ---
  if (style.includes('commander')) {
    const mouthRight = getPt(291);
    const sbRight = getPt(454);
    const mouthLeft = getPt(61);
    const sbLeft = getPt(234);

    const cheekRightMid = { 
      x: (mouthRight.x + sbRight.x) / 2, 
      y: (mouthRight.y + sbRight.y) / 2 - 30 
    };
    const cheekLeftMid = { 
      x: (mouthLeft.x + sbLeft.x) / 2, 
      y: (mouthLeft.y + sbLeft.y) / 2 - 30
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
      ctx.lineTo(p.x, p.y + 12); 
    });

    ctx.quadraticCurveTo(cheekLeftMid.x, cheekLeftMid.y, sbLeft.x, sbLeft.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
};
