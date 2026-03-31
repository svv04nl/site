import * as migration_20260330_171130 from './20260330_171130';

export const migrations = [
  {
    up: migration_20260330_171130.up,
    down: migration_20260330_171130.down,
    name: '20260330_171130'
  },
];
