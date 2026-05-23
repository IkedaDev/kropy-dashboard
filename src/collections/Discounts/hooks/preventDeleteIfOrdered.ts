import { CollectionBeforeDeleteHook } from 'payload'

export const preventDeleteIfOrdered: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const { totalDocs: orderCount } = await req.payload.count({
    collection: 'orders',
    where: {
      discountCode: {
        equals: id,
      },
    },
    req,
  })

  if (orderCount > 0) {
    throw new Error(
      'No se puede eliminar este cupón porque ha sido utilizado en órdenes de compra existentes. ' +
      'Para inhabilitarlo de forma segura, desmarca la casilla "Activo".'
    )
  }
}
