export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  tubes: string[];
  lights: string[];
  intensity: number;
  badge?: string;
}

export interface TubeConfig {
  tubes: string[];
  lights: string[];
  intensity: number;
}
