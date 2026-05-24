import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { es } from '@payloadcms/translations/languages/es'
import { en } from '@payloadcms/translations/languages/en'

import { Pages } from './collections/Pages'
import { Tenants } from './collections/Tenants'
import Users from './collections/Users'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { isSuperAdmin } from './access/isSuperAdmin'
import type { Config } from './payload-types'
import { getUserTenantIDs } from './utilities/getUserTenantIDs'
import { seed } from './seed'
import { Products } from './collections/Products'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Categories } from './collections/Categories'
import { StoreSettings } from './collections/StoreSettings'
import { Customers } from './collections/Customers'
import { Discounts } from './collections/Discounts'
import { Brands } from './collections/Brands'
import { ProductReviews } from './collections/ProductReviews'
import { Authors } from './collections/Authors'
import { BlogCategories } from './collections/BlogCategories'
import { Posts } from './collections/Posts'
import { ModifierGroups } from './collections/ModifierGroups'
import { MenuSections } from './collections/MenuSections'
import { MenuItems } from './collections/MenuItems'
import { Combos } from './collections/Combos'
import { Menus } from './collections/Menus'
import { Galleries } from './collections/Galleries'
import { GalleryCategories } from './collections/GalleryCategories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    user: 'users',

    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      providers: [
        '/app/components/ForceThemeProvider'
      ],
      graphics: {
        Icon: '/components/payload/Icon',
        Logo: '/components/payload/Logo',
      },
      header: [
        '/components/payload/Header'
      ],
      Nav: '/components/payload/Nav',
      views: {
        dashboard: {
          Component: '/components/payload/views/Welcome',
        },
        ecommerceDashboard: {
          Component: '/components/payload/views/ecommerce',
          path: '/ecommerce-dashboard',
        },
      },
    }
  },
  collections: [
    Pages,
    Users,
    Tenants,
    Products,
    Media,
    Orders,
    Categories,
    StoreSettings,
    Customers,
    Discounts,
    Brands,
    ProductReviews,
    Authors,
    BlogCategories,
    Posts,
    ModifierGroups,
    MenuSections,
    MenuItems,
    Combos,
    Menus,
    Galleries,
    GalleryCategories
  ],
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URL as string,
  // }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),
  // onInit: async (args) => {
  //   if (process.env.SEED_DB) {
  //     await seed(args)
  //   }
  // },
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    multiTenantPlugin<Config>({
      collections: {
        pages: {},
        products: {},
        media: {},
        orders: {},
        categories: {},
        'store-settings': {},
        customers: {},
        discounts: {},
        brands: {},
        'product-reviews': {},
        authors: {},
        'blog-categories': {},
        posts: {},
        'modifier-groups': {},
        'menu-sections': {},
        'menu-items': {},
        combos: {},
        menus: {},
        galleries: {},
        'gallery-categories': {},
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user)) {
              return true
            }
            return getUserTenantIDs(req.user).length > 0
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
  ],
  localization: {
    locales: ['es', 'en'],
    defaultLocale: 'es', // Idioma base para tus clientes en Chile
    fallback: true,      // Si no hay traducción en inglés, muestra el texto en español por defecto
  },
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: 'es',
  },
})


