import * as migration_20260331_072441 from './20260331_072441';
import * as migration_20260331_202928 from './20260331_202928';
import * as migration_20260331_add_actie_section from './20260331_add_actie_section';
import * as migration_20260401_091302 from './20260401_091302';

export const migrations = [
  {
    up: migration_20260331_072441.up,
    down: migration_20260331_072441.down,
    name: '20260331_072441',
  },
  {
    up: migration_20260331_202928.up,
    down: migration_20260331_202928.down,
    name: '20260331_202928',
  },
  {
    up: migration_20260331_add_actie_section.up,
    down: migration_20260331_add_actie_section.down,
    name: '20260331_add_actie_section',
  },
  {
    up: migration_20260401_091302.up,
    down: migration_20260401_091302.down,
    name: '20260401_091302'
  },
];
