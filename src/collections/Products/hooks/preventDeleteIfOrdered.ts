import { CollectionBeforeDeleteHook } from 'payload'

export const preventDeleteIfOrdered: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const { totalDocs: orderCount } = await req.payload.count({
    collection: 'orders',
    where: {
      'items.product': {
        equals: id,
      },
    },
    req,
  })

  if (orderCount > 0) {
    throw new Error(
      'No se puede eliminar este producto porque está asociado a órdenes de compra existentes. ' +
      'Para retirarlo de la tienda de forma segura, te sugerimos dejar su stock en 0 o desactivarlo.'
    )
  }
}
