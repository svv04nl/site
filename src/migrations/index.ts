import * as migration_20260811_103337_baseline_prod_schema from './20260811_103337_baseline_prod_schema';
import * as migration_20260811_103354_homepage_2a from './20260811_103354_homepage_2a';
import * as migration_20260814_141114_normalize_youth_team_names from './20260814_141114_normalize_youth_team_names';
import * as migration_20260816_123006_add_messages_contacts_pages from './20260816_123006_add_messages_contacts_pages';
import * as migration_20260913_074545 from './20260913_074545';
import * as migration_20260914_060139 from './20260914_060139';

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
    name: '20260914_060139'
  },
];
