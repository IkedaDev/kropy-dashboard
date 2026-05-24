import * as migration_20260523_223804_init from './20260523_223804_init';
import * as migration_20260524_005010_init_gallery from './20260524_005010_init_gallery';
import * as migration_20260524_205247_add_media_url_field from './20260524_205247_add_media_url_field';

export const migrations = [
  {
    up: migration_20260523_223804_init.up,
    down: migration_20260523_223804_init.down,
    name: '20260523_223804_init',
  },
  {
    up: migration_20260524_005010_init_gallery.up,
    down: migration_20260524_005010_init_gallery.down,
    name: '20260524_005010_init_gallery',
  },
  {
    up: migration_20260524_205247_add_media_url_field.up,
    down: migration_20260524_205247_add_media_url_field.down,
    name: '20260524_205247_add_media_url_field'
  },
];
