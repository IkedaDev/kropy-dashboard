import { CollectionBeforeDeleteHook } from 'payload'

export const preventDeleteIfOrdered: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const { totalDocs: orderCount } = await req.payload.count({
    collection: 'orders',
    where: {
      customerRef: {
        equals: id,
      },
    },
    req,
  })

  if (orderCount > 0) {
    throw new Error(
      'No se puede eliminar la ficha de este cliente porque posee órdenes de compra registradas. ' +
      'Para inhabilitarlo, puedes editar su ficha o notas.'
    )
  }
}
