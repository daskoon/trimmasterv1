import type { BeardStyle } from './types';

export const APP_NAME = "TrimMaster";

export const CAPTURE_ANGLES: { id: string; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'under', label: 'Under' },
];

export const BEARD_STYLES: BeardStyle[] = [
  { 
    id: 'commander', 
    name: 'The Commander', 
    image: '/riker.png',
    referenceImages: {} 
  },
  { 
    id: 'goatee', 
    name: 'The Goatee', 
    image: '/goatee.webp',
    referenceImages: {} 
  },
  { 
    id: 'laserline', 
    name: 'The Chin Strap', 
    image: '/laserline.webp',
    referenceImages: {} 
  },
  { 
    id: 'stache', 
    name: 'The Stache', 
    image: '/stache.jpg',
    referenceImages: {} 
  },
];