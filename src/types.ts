export type CaptureAngle = 'front' | 'left' | 'right' | 'under';

export interface BeardStyle {
  id: string;
  name: string;
  image: string; // The Unsplash URL for the gallery
  referenceImages: Partial<Record<CaptureAngle, string>>;
}

export type CapturedImages = Record<CaptureAngle, string>;
