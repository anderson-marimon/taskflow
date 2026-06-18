import { config } from 'dotenv';

let loaded = false;

export function loadEnv(): void {
  if (loaded) return;
  config({ override: false });
  loaded = true;
}

export function _resetForTest(): void {
  loaded = false;
}
