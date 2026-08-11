import * as migration_20260811_103337_baseline_prod_schema from './20260811_103337_baseline_prod_schema';
import * as migration_20260811_103354_homepage_2a from './20260811_103354_homepage_2a';

export const migrations = [
  {
    up: migration_20260811_103337_baseline_prod_schema.up,
    down: migration_20260811_103337_baseline_prod_schema.down,
    name: '20260811_103337_baseline_prod_schema',
  },
  {
    up: migration_20260811_103354_homepage_2a.up,
    down: migration_20260811_103354_homepage_2a.down,
    name: '20260811_103354_homepage_2a'
  },
];
