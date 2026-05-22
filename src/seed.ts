import { Config } from 'payload'

// Helper para crear texto en formato Lexical para RichText
function createLexicalRichText(text: string): any {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: null,
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: text,
              type: 'text',
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

// Helper para crear media (imagen placeholder transparente 1x1)
async function createDummyMedia(payload: any, filename: string, tenantId: string | number) {
  try {
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    return await payload.create({
      collection: 'media',
      data: {
        tenant: tenantId,
      },
      file: {
        data: Buffer.from(pngBase64, 'base64'),
        name: filename,
        mimetype: 'image/png',
        size: 68,
      },
    })
  } catch (err: any) {
    payload.logger.error(`Error al crear media "${filename}": ${err?.message || err}`)
    return null
  }
}

export const seed: NonNullable<Config['onInit']> = async (payload): Promise<void> => {
  payload.logger.info('=== INICIANDO LIMPIEZA DE BASE DE DATOS ===')

  // Limpiar colecciones en orden para respetar dependencias
  const collectionsToClear = [
    'product-reviews',
    'orders',
    'discounts',
    'products',
    'categories',
    'brands',
    'store-settings',
    'customers',
    'media',
    'pages',
    'users',
    'tenants',
  ]

  for (const slug of collectionsToClear) {
    try {
      await payload.delete({
        collection: slug as any,
        where: {
          id: {
            exists: true,
          },
        },
      })
      payload.logger.info(`Limpieza exitosa: ${slug}`)
    } catch (err: any) {
      payload.logger.warn(`No se pudo limpiar la colección "${slug}": ${err?.message || err}`)
    }
  }

  payload.logger.info('=== CREANDO TENANTS ===')

  const tenant1 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 1',
      slug: 'gold',
      domain: 'gold.localhost',
    },
  })

  const tenant2 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 2',
      slug: 'silver',
      domain: 'silver.localhost',
    },
  })

  const tenant3 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 3',
      slug: 'bronze',
      domain: 'bronze.localhost',
    },
  })

  payload.logger.info('=== CREANDO USUARIOS ===')

  await payload.create({
    collection: 'users',
    data: {
      email: 'demo@payloadcms.com',
      password: 'demo',
      roles: ['super-admin'],
    },
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant1@payloadcms.com',
      password: 'demo',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant1.id,
        },
      ],
      username: 'tenant1',
    },
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant2@payloadcms.com',
      password: 'demo',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant2.id,
        },
      ],
      username: 'tenant2',
    },
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant3@payloadcms.com',
      password: 'demo',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant3.id,
        },
      ],
      username: 'tenant3',
    },
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'multi-admin@payloadcms.com',
      password: 'demo',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant1.id,
        },
        {
          roles: ['tenant-admin'],
          tenant: tenant2.id,
        },
        {
          roles: ['tenant-admin'],
          tenant: tenant3.id,
        },
      ],
      username: 'multi-admin',
    },
  })

  payload.logger.info('=== CREANDO RECURSOS DE MEDIA ===')

  const mediaGold = await createDummyMedia(payload, 'placeholder-gold.png', tenant1.id)
  const mediaSilver = await createDummyMedia(payload, 'placeholder-silver.png', tenant2.id)
  const mediaBronze = await createDummyMedia(payload, 'placeholder-bronze.png', tenant3.id)

  const mediaGoldId = mediaGold ? mediaGold.id : undefined
  const mediaSilverId = mediaSilver ? mediaSilver.id : undefined
  const mediaBronzeId = mediaBronze ? mediaBronze.id : undefined

  payload.logger.info('=== CREANDO PAGINAS ===')

  await payload.create({
    collection: 'pages',
    data: {
      slug: 'home',
      tenant: tenant1.id,
      title: 'Page for Tenant 1',
      logo: mediaGoldId,
      favicon: mediaGoldId,
      contactInfo: {
        phone: '+56911112222',
        email: 'contacto@gold.com',
        address: 'Av. Providencia 1234, Santiago',
      },
      socialLinks: {
        instagram: 'https://instagram.com/kropy_gold',
        facebook: 'https://facebook.com/kropy_gold',
        whatsapp: '+56911112222',
        twitter: 'https://x.com/kropy_gold',
      },
    },
  })

  await payload.create({
    collection: 'pages',
    data: {
      slug: 'home',
      tenant: tenant2.id,
      title: 'Page for Tenant 2',
      logo: mediaSilverId,
      favicon: mediaSilverId,
      contactInfo: {
        phone: '+15550199',
        email: 'support@silver.com',
        address: '123 Main Street, New York',
      },
      socialLinks: {
        whatsapp: '+15550199',
      },
    },
  })

  await payload.create({
    collection: 'pages',
    data: {
      slug: 'home',
      tenant: tenant3.id,
      title: 'Page for Tenant 3',
      logo: mediaBronzeId,
      favicon: mediaBronzeId,
      contactInfo: {
        phone: '+56999998888',
        email: 'ventas@bronze.com',
        address: 'Calle Esmeralda 432, Valparaíso',
      },
      socialLinks: {
        facebook: 'https://facebook.com/kropy_books',
      },
    },
  })

  payload.logger.info('=== CREANDO CONFIGURACIONES DE TIENDA (STORE SETTINGS) ===')

  // Tenant 1 Settings
  await payload.create({
    collection: 'store-settings',
    data: {
      name: 'Configuración de Tienda',
      shipping: {
        flatRate: 3500,
        description: createLexicalRichText('Envíos rápidos a todo Chile continental vía Starken o Chilexpress.'),
      },
      tenant: tenant1.id,
    },
  })

  // Tenant 2 Settings
  await payload.create({
    collection: 'store-settings',
    data: {
      name: 'Configuración de Tienda',
      shipping: {
        flatRate: 15,
        description: createLexicalRichText('Worldwide shipping via DHL Express. Customs fees may apply.'),
      },
      tenant: tenant2.id,
    },
  })

  // Tenant 3 Settings
  await payload.create({
    collection: 'store-settings',
    data: {
      name: 'Configuración de Tienda',
      shipping: {
        flatRate: 2500,
        description: createLexicalRichText('Envíos a todo Chile. Retiro en tienda disponible gratis.'),
      },
      tenant: tenant3.id,
    },
  })

  payload.logger.info('=== CREANDO MARCAS (BRANDS) ===')

  const brandNike = await payload.create({
    collection: 'brands',
    data: {
      name: 'Nike',
      description: createLexicalRichText('Just do it. Líder mundial en calzado y ropa deportiva.'),
      tenant: tenant1.id,
    },
  })

  const brandAdidas = await payload.create({
    collection: 'brands',
    data: {
      name: 'Adidas',
      description: createLexicalRichText('Impossible is nothing. Diseño y estilo deportivo.'),
      tenant: tenant1.id,
    },
  })

  const brandApple = await payload.create({
    collection: 'brands',
    data: {
      name: 'Apple',
      description: createLexicalRichText('Think different. Tecnología premium e innovación.'),
      tenant: tenant2.id,
    },
  })

  const brandSamsung = await payload.create({
    collection: 'brands',
    data: {
      name: 'Samsung',
      description: createLexicalRichText('Inspire the world, create the future.'),
      tenant: tenant2.id,
    },
  })

  const brandPlaneta = await payload.create({
    collection: 'brands',
    data: {
      name: 'Editorial Planeta',
      description: createLexicalRichText('Grupo editorial líder en España y América Latina.'),
      tenant: tenant3.id,
    },
  })

  const brandPenguin = await payload.create({
    collection: 'brands',
    data: {
      name: 'Penguin Books',
      description: createLexicalRichText('Casa editorial internacional de alta literatura y ficción.'),
      tenant: tenant3.id,
    },
  })

  payload.logger.info('=== CREANDO CATEGORIAS (CATEGORIES) ===')

  const catCalzado = await payload.create({
    collection: 'categories',
    data: {
      title: 'Calzado',
      slug: 'calzado',
      tenant: tenant1.id,
    },
  })

  const catRopa = await payload.create({
    collection: 'categories',
    data: {
      title: 'Ropa Deportiva',
      slug: 'ropa-deportiva',
      tenant: tenant1.id,
    },
  })

  const catSmartphones = await payload.create({
    collection: 'categories',
    data: {
      title: 'Smartphones',
      slug: 'smartphones',
      tenant: tenant2.id,
    },
  })

  const catAccesorios = await payload.create({
    collection: 'categories',
    data: {
      title: 'Accesorios',
      slug: 'accesorios',
      tenant: tenant2.id,
    },
  })

  const catFiccion = await payload.create({
    collection: 'categories',
    data: {
      title: 'Ficción',
      slug: 'ficcion',
      tenant: tenant3.id,
    },
  })

  const catAutoayuda = await payload.create({
    collection: 'categories',
    data: {
      title: 'Autoayuda',
      slug: 'autoayuda',
      tenant: tenant3.id,
    },
  })

  payload.logger.info('=== CREANDO PRODUCTOS (PRODUCTS) ===')

  // Tenant 1 Products
  const prodRunning = await payload.create({
    collection: 'products',
    data: {
      title: 'Zapatillas Running Ultra',
      slug: 'zapatillas-running-ultra',
      price: 89990,
      compareAtPrice: 109990,
      stock: 0, // tiene variantes
      description: createLexicalRichText('Zapatillas premium para running de larga distancia con amortiguación de última generación.'),
      images: mediaGoldId ? [{ image: mediaGoldId }] : [],
      categories: [catCalzado.id],
      brand: brandNike.id,
      hasVariants: true,
      variants: [
        {
          variantName: 'Talla 40',
          sku: 'NIKE-RUN-40',
          price: 89990,
          compareAtPrice: 109990,
          stock: 10,
        },
        {
          variantName: 'Talla 41',
          sku: 'NIKE-RUN-41',
          price: 89990,
          compareAtPrice: 109990,
          stock: 15,
        },
        {
          variantName: 'Talla 42',
          sku: 'NIKE-RUN-42',
          price: 94990, // Talla más grande a mayor precio
          compareAtPrice: 114990,
          stock: 5,
        },
      ],
      tenant: tenant1.id,
    },
  })

  const prodPolera = await payload.create({
    collection: 'products',
    data: {
      title: 'Polera DryFit Pro',
      slug: 'polera-dryfit-pro',
      price: 24990,
      compareAtPrice: 29990,
      stock: 50,
      description: createLexicalRichText('Polera transpirable de secado rápido, perfecta para entrenamientos de alta intensidad.'),
      images: mediaGoldId ? [{ image: mediaGoldId }] : [],
      categories: [catRopa.id],
      brand: brandNike.id,
      hasVariants: false,
      tenant: tenant1.id,
    },
  })

  // Tenant 2 Products
  const prodIphone = await payload.create({
    collection: 'products',
    data: {
      title: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      price: 999,
      stock: 0,
      description: createLexicalRichText('El último smartphone insignia de Apple con diseño de titanio y chip A17 Pro.'),
      images: mediaSilverId ? [{ image: mediaSilverId }] : [],
      categories: [catSmartphones.id],
      brand: brandApple.id,
      hasVariants: true,
      variants: [
        {
          variantName: '128GB',
          sku: 'APL-IPH15P-128',
          price: 999,
          stock: 5,
        },
        {
          variantName: '256GB',
          sku: 'APL-IPH15P-256',
          price: 1099,
          stock: 3,
        },
      ],
      tenant: tenant2.id,
    },
  })

  const prodCharger = await payload.create({
    collection: 'products',
    data: {
      title: 'Cargador Rápido 20W',
      slug: 'cargador-rapido-20w',
      price: 29,
      stock: 100,
      description: createLexicalRichText('Cargador de pared USB-C ultra rápido compatible con iPhone y Android.'),
      images: mediaSilverId ? [{ image: mediaSilverId }] : [],
      categories: [catAccesorios.id],
      brand: brandSamsung.id,
      hasVariants: false,
      tenant: tenant2.id,
    },
  })

  // Tenant 3 Products
  const prodSoledad = await payload.create({
    collection: 'products',
    data: {
      title: 'Cien años de soledad',
      slug: 'cien-anos-de-soledad',
      price: 18990,
      stock: 20,
      description: createLexicalRichText('La obra cumbre de Gabriel García Márquez y exponente principal del realismo mágico.'),
      images: mediaBronzeId ? [{ image: mediaBronzeId }] : [],
      categories: [catFiccion.id],
      brand: brandPlaneta.id,
      hasVariants: false,
      tenant: tenant3.id,
    },
  })

  const prodHabitos = await payload.create({
    collection: 'products',
    data: {
      title: 'Hábitos Atómicos',
      slug: 'habitos-atomicos',
      price: 19990,
      stock: 15,
      description: createLexicalRichText('James Clear presenta un método sencillo y comprobado para desarrollar buenos hábitos.'),
      images: mediaBronzeId ? [{ image: mediaBronzeId }] : [],
      categories: [catAutoayuda.id],
      brand: brandPenguin.id,
      hasVariants: false,
      tenant: tenant3.id,
    },
  })

  payload.logger.info('=== CREANDO CUPONES (DISCOUNTS) ===')

  // Tenant 1 Discounts
  const discountPromo10 = await payload.create({
    collection: 'discounts',
    data: {
      code: 'PROMO10',
      type: 'percentage',
      value: 10,
      active: true,
      tenant: tenant1.id,
    },
  })

  const discountFijo5000 = await payload.create({
    collection: 'discounts',
    data: {
      code: 'DESCUENTO5000',
      type: 'fixed',
      value: 5000,
      minPurchaseAmount: 30000,
      active: true,
      tenant: tenant1.id,
    },
  })

  const discountCalzado = await payload.create({
    collection: 'discounts',
    data: {
      code: 'SOLOCALZADO',
      type: 'percentage',
      value: 15,
      applicableCategories: [catCalzado.id],
      active: true,
      tenant: tenant1.id,
    },
  })

  // Tenant 2 Discounts
  const discountWelcome50 = await payload.create({
    collection: 'discounts',
    data: {
      code: 'WELCOME50',
      type: 'fixed',
      value: 50,
      minPurchaseAmount: 500,
      active: true,
      tenant: tenant2.id,
    },
  })

  payload.logger.info('=== CREANDO CLIENTES (CUSTOMERS) ===')

  const custJuan = await payload.create({
    collection: 'customers',
    data: {
      name: 'Juan Pérez',
      email: 'juan@gmail.com',
      phone: '+56987654321',
      address: 'Av. Providencia 1234, Dpto 402, Santiago',
      tenant: tenant1.id,
    },
  })

  const custMaria = await payload.create({
    collection: 'customers',
    data: {
      name: 'María González',
      email: 'maria@gmail.com',
      phone: '+56912345678',
      address: 'Av. Apoquindo 4500, Las Condes, Santiago',
      tenant: tenant1.id,
    },
  })

  const custJohn = await payload.create({
    collection: 'customers',
    data: {
      name: 'John Doe',
      email: 'john@doe.com',
      phone: '+15558989',
      address: '123 Main Street, Apt 5B, New York, NY',
      tenant: tenant2.id,
    },
  })

  const custCarlos = await payload.create({
    collection: 'customers',
    data: {
      name: 'Carlos Ruiz',
      email: 'carlos@ruiz.com',
      phone: '+56999998888',
      address: 'Calle Esmeralda 432, Valparaíso',
      tenant: tenant3.id,
    },
  })

  payload.logger.info('=== CREANDO ORDENES (ORDERS) ===')

  // Obtener IDs de variantes reales autogenerados por la base de datos
  const varRunning41Id = prodRunning.variants?.find((v: any) => v.variantName.includes('41'))?.id || 'v41'
  const varIphone128Id = prodIphone.variants?.find((v: any) => v.variantName.includes('128GB'))?.id || 'v128'

  // Orden 1 (Cancelada, Tenant 1): Juan Pérez compra 1 Zapatillas (Talla 41)
  await payload.create({
    collection: 'orders',
    data: {
      orderCode: 'ORD-00001',
      externalId: 'ext-order-001',
      customerRef: custJuan.id,
      customer: {
        name: custJuan.name,
        email: custJuan.email,
        phone: custJuan.phone || '',
        shippingAddress: custJuan.address || '',
      },
      items: [
        {
          product: prodRunning.id,
          variantId: varRunning41Id,
          title: 'Zapatillas Running Ultra - Talla 41',
          price: 89990,
          quantity: 1,
        },
      ],
      subtotal: 89990,
      shippingCost: 3500,
      discountAmount: 8999, // 10%
      total: 84491,
      status: 'cancelled',
      discountCode: discountPromo10.id,
      tenant: tenant1.id,
    },
  })

  // Orden 2 (Pagada, Tenant 1): María González compra 2 Poleras
  await payload.create({
    collection: 'orders',
    data: {
      orderCode: 'ORD-00002',
      externalId: 'ext-order-002',
      customerRef: custMaria.id,
      customer: {
        name: custMaria.name,
        email: custMaria.email,
        phone: custMaria.phone || '',
        shippingAddress: custMaria.address || '',
      },
      items: [
        {
          product: prodPolera.id,
          title: 'Polera DryFit Pro',
          price: 24990,
          quantity: 2,
        },
      ],
      subtotal: 49980,
      shippingCost: 3500,
      discountAmount: 4998, // 10%
      total: 48482,
      status: 'paid',
      discountCode: discountPromo10.id,
      tenant: tenant1.id,
    },
  })

  // Orden 3 (Pendiente, Tenant 2): John Doe compra iPhone 15 Pro 128GB
  await payload.create({
    collection: 'orders',
    data: {
      orderCode: 'ORD-00003',
      externalId: 'ext-order-003',
      customerRef: custJohn.id,
      customer: {
        name: custJohn.name,
        email: custJohn.email,
        phone: custJohn.phone || '',
        shippingAddress: custJohn.address || '',
      },
      items: [
        {
          product: prodIphone.id,
          variantId: varIphone128Id,
          title: 'iPhone 15 Pro - 128GB',
          price: 999,
          quantity: 1,
        },
      ],
      subtotal: 999,
      shippingCost: 15,
      discountAmount: 0,
      total: 1014,
      status: 'pending',
      tenant: tenant2.id,
    },
  })

  // Orden 4 (Enviada, Tenant 3): Carlos Ruiz compra Cien años de soledad + Hábitos Atómicos
  await payload.create({
    collection: 'orders',
    data: {
      orderCode: 'ORD-00004',
      externalId: 'ext-order-004',
      customerRef: custCarlos.id,
      customer: {
        name: custCarlos.name,
        email: custCarlos.email,
        phone: custCarlos.phone || '',
        shippingAddress: custCarlos.address || '',
      },
      items: [
        {
          product: prodSoledad.id,
          title: 'Cien años de soledad',
          price: 18990,
          quantity: 1,
        },
        {
          product: prodHabitos.id,
          title: 'Hábitos Atómicos',
          price: 19990,
          quantity: 1,
        },
      ],
      subtotal: 38980,
      shippingCost: 2500,
      discountAmount: 0,
      total: 41480,
      status: 'shipped',
      shippingCourier: 'Starken',
      trackingNumber: 'STK987654321',
      internalNotes: 'Entregar en portería del edificio si el destinatario no se encuentra.',
      tenant: tenant3.id,
    },
  })

  payload.logger.info('=== CREANDO OPINIONES (PRODUCT REVIEWS) ===')

  // Review 1 (Aprobada, Tenant 1): Juan Pérez opina sobre Running Ultra
  await payload.create({
    collection: 'product-reviews',
    data: {
      product: prodRunning.id,
      customer: custJuan.id,
      reviewerName: 'Juan Pérez',
      rating: 4,
      comment: 'Zapatillas muy cómodas y ligeras para tiradas largas. El único detalle es que la talla corre un poco pequeña, sugiero comprar medio número más.',
      approved: true,
      tenant: tenant1.id,
    },
  })

  // Review 2 (Aprobada, Tenant 1): María González opina sobre Polera DryFit
  await payload.create({
    collection: 'product-reviews',
    data: {
      product: prodPolera.id,
      customer: custMaria.id,
      reviewerName: 'María G.',
      rating: 5,
      comment: 'Espectacular calidad del tejido, no retiene sudor y es comodísima para correr en verano.',
      approved: true,
      tenant: tenant1.id,
    },
  })

  // Review 3 (No Aprobada aún, Tenant 2): Review anónima de iPhone
  await payload.create({
    collection: 'product-reviews',
    data: {
      product: prodIphone.id,
      customer: custJohn.id,
      reviewerName: 'Comprador Gadgets',
      rating: 5,
      comment: 'La pantalla de 120Hz y el titanio se sienten brutales. Vale cada centavo.',
      approved: false,
      tenant: tenant2.id,
    },
  })

  // Review 4 (Aprobada, Tenant 3): Carlos Ruiz opina sobre Soledad
  await payload.create({
    collection: 'product-reviews',
    data: {
      product: prodSoledad.id,
      customer: custCarlos.id,
      reviewerName: 'Carlos Ruiz',
      rating: 5,
      comment: 'Absolutamente imprescindible. Una obra maestra que se debe releer varias veces en la vida.',
      approved: true,
      tenant: tenant3.id,
    },
  })

  payload.logger.info('=== BASE DE DATOS SEMBRADA CON ÉXITO ===')
}
