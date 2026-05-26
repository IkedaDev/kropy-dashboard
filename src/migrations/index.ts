import * as migration_20260523_223804_init from './20260523_223804_init';
import * as migration_20260524_005010_init_gallery from './20260524_005010_init_gallery';
import * as migration_20260524_205247_add_media_url_field from './20260524_205247_add_media_url_field';
import * as migration_20260526_010000_add_buckets_to_tenants from './20260526_010000_add_buckets_to_tenants';
import * as migration_20260526_020000_enable_media_uploads from './20260526_020000_enable_media_uploads';

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
  {
    up: migration_20260526_010000_add_buckets_to_tenants.up,
    down: migration_20260526_010000_add_buckets_to_tenants.down,
    name: '20260526_010000_add_buckets_to_tenants'
  },
  {
    up: migration_20260526_020000_enable_media_uploads.up,
    down: migration_20260526_020000_enable_media_uploads.down,
    name: '20260526_020000_enable_media_uploads'
  },
];
