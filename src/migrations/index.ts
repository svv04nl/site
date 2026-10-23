import * as migration_20260811_103337_baseline_prod_schema from './20260811_103337_baseline_prod_schema';
import * as migration_20260811_103354_homepage_2a from './20260811_103354_homepage_2a';
import * as migration_20260814_141114_normalize_youth_team_names from './20260814_141114_normalize_youth_team_names';
import * as migration_20260816_123006_add_messages_contacts_pages from './20260816_123006_add_messages_contacts_pages';
import * as migration_20260913_074545 from './20260913_074545';
import * as migration_20260914_060139 from './20260914_060139';
import * as migration_20260914_174545 from './20260914_174545';
import * as migration_20260914_180444 from './20260914_180444';
import * as migration_20260930_133111 from './20260930_133111';
import * as migration_20261009_182825 from './20261009_182825';
import * as migration_20261010_065031 from './20261010_065031';
import * as migration_20261014_210738 from './20261014_210738';
import * as migration_20261015_071116 from './20261015_071116';
import * as migration_20261023_064539 from './20261023_064539';
import * as migration_20261023_070257 from './20261023_070257';

export const migrations = [
  {
    up: migration_20260811_103337_baseline_prod_schema.up,
    down: migration_20260811_103337_baseline_prod_schema.down,
    name: '20260811_103337_baseline_prod_schema',
  },
  {
    up: migration_20260811_103354_homepage_2a.up,
    down: migration_20260811_103354_homepage_2a.down,
    name: '20260811_103354_homepage_2a',
  },
  {
    up: migration_20260814_141114_normalize_youth_team_names.up,
    down: migration_20260814_141114_normalize_youth_team_names.down,
    name: '20260814_141114_normalize_youth_team_names',
  },
  {
    up: migration_20260816_123006_add_messages_contacts_pages.up,
    down: migration_20260816_123006_add_messages_contacts_pages.down,
    name: '20260816_123006_add_messages_contacts_pages',
  },
  {
    up: migration_20260913_074545.up,
    down: migration_20260913_074545.down,
    name: '20260913_074545',
  },
  {
    up: migration_20260914_060139.up,
    down: migration_20260914_060139.down,
    name: '20260914_060139',
  },
  {
    up: migration_20260914_174545.up,
    down: migration_20260914_174545.down,
    name: '20260914_174545',
  },
  {
    up: migration_20260914_180444.up,
    down: migration_20260914_180444.down,
    name: '20260914_180444',
  },
  {
    up: migration_20260930_133111.up,
    down: migration_20260930_133111.down,
    name: '20260930_133111',
  },
  {
    up: migration_20261009_182825.up,
    down: migration_20261009_182825.down,
    name: '20261009_182825',
  },
  {
    up: migration_20261010_065031.up,
    down: migration_20261010_065031.down,
    name: '20261010_065031',
  },
  {
    up: migration_20261014_210738.up,
    down: migration_20261014_210738.down,
    name: '20261014_210738',
  },
  {
    up: migration_20261015_071116.up,
    down: migration_20261015_071116.down,
    name: '20261015_071116',
  },
  {
    up: migration_20261023_064539.up,
    down: migration_20261023_064539.down,
    name: '20261023_064539',
  },
  {
    up: migration_20261023_070257.up,
    down: migration_20261023_070257.down,
    name: '20261023_070257'
  },
];
