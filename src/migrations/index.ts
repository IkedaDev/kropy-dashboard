import * as migration_20260523_223804_init from './20260523_223804_init';
import * as migration_20260524_005010_init_gallery from './20260524_005010_init_gallery';

export const migrations = [
  {
    up: migration_20260523_223804_init.up,
    down: migration_20260523_223804_init.down,
    name: '20260523_223804_init',
  },
  {
    up: migration_20260524_005010_init_gallery.up,
    down: migration_20260524_005010_init_gallery.down,
    name: '20260524_005010_init_gallery'
  },
];
