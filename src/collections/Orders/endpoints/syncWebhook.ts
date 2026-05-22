import { PayloadHandler } from 'payload'

export const syncWebhook: PayloadHandler = async (req) => {
  try {
    const apiKey = req.headers.get('x-kropy-api-key')
    const expectedToken = process.env.KROPY_INTERNAL_API_TOKEN

    // 1. Validar la API Key
    if (!expectedToken || apiKey !== expectedToken) {
      return Response.json(
        { error: 'Unauthorized: Invalid or missing API Key.' },
        { status: 401 },
      )
    }

    // 2. Parsear el cuerpo de la petición
    let body: any = {}
    try {
      if (req.json) {
        body = await req.json()
      } else if (typeof req.text === 'function') {
        const text = await req.text()
        body = JSON.parse(text)
      }
    } catch (error) {
      return Response.json(
        { error: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const { orderCode, externalId, customer, items, total, status, tenant } = body

    // 3. Validar los campos obligatorios
    if (!orderCode || !externalId || !customer || !items || total === undefined || !tenant) {
      return Response.json(
        {
          error: 'Missing required fields. Required: orderCode, externalId, customer, items, total, tenant.',
        },
        { status: 400 },
      )
    }

    if (!customer.name || !customer.email) {
      return Response.json(
        { error: 'Customer must include name and email.' },
        { status: 400 },
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(
        { error: 'Items must be a non-empty array.' },
        { status: 400 },
      )
    }

    for (const item of items) {
      if (!item.title || item.price === undefined || !item.quantity) {
        return Response.json(
          { error: 'Each item must have a title, price, and quantity.' },
          { status: 400 },
        )
      }
    }

    // 4. Verificar si el Tenant existe en la base de datos
    try {
      const tenantDoc = await req.payload.findByID({
        collection: 'tenants',
        id: tenant,
      })
      if (!tenantDoc) {
        return Response.json(
          { error: `Tenant with ID "${tenant}" not found.` },
          { status: 400 },
        )
      }
    } catch (err) {
      return Response.json(
        { error: `Tenant with ID "${tenant}" not found or ID format is invalid.` },
        { status: 400 },
      )
    }

    // 5. Buscar si ya existe la orden por su ID Externo (externalId)
    const existingOrders = await req.payload.find({
      collection: 'orders',
      where: {
        externalId: {
          equals: externalId,
        },
      },
      limit: 1,
    })

    if (existingOrders.docs.length > 0) {
      // 6. Si existe, actualizamos los datos de la orden
      const updatedOrder = await req.payload.update({
        collection: 'orders',
        id: existingOrders.docs[0].id,
        data: {
          orderCode,
          customer,
          items,
          total,
          status: status || existingOrders.docs[0].status,
          tenant,
        },
      })

      return Response.json(
        { message: 'Order updated successfully.', order: updatedOrder },
        { status: 200 },
      )
    } else {
      // 7. Si no existe, creamos la orden
      const createdOrder = await req.payload.create({
        collection: 'orders',
        data: {
          orderCode,
          externalId,
          customer,
          items,
          total,
          status: status || 'pending',
          tenant,
        },
      })

      return Response.json(
        { message: 'Order created successfully.', order: createdOrder },
        { status: 201 },
      )
    }
  } catch (error: any) {
    req.payload.logger.error(`Error in Orders sync webhook: ${error?.message || error}`)
    return Response.json(
      { error: 'Internal Server Error.' },
      { status: 500 },
    )
  }
}
