import * as migration_20260409_190422 from './20260409_190422';
import * as migration_20260409_204203 from './20260409_204203';

export const migrations = [
  {
    up: migration_20260409_190422.up,
    down: migration_20260409_190422.down,
    name: '20260409_190422',
  },
  {
    up: migration_20260409_204203.up,
    down: migration_20260409_204203.down,
    name: '20260409_204203'
  },
];
