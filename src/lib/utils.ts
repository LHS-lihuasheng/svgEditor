import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Crop } from "react-image-crop"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCropCoordinates(crop: Crop): string {
  const x1 = Math.max(0, Math.min(1, crop.x)).toFixed(6)
  const y1 = Math.max(0, Math.min(1, crop.y)).toFixed(6)
  const x2 = Math.max(0, Math.min(1, crop.x + crop.width)).toFixed(6)
  const y2 = Math.max(0, Math.min(1, crop.y + crop.height)).toFixed(6)
  
  return `${x1}_${y1}_${x2}_${y2}`
}
