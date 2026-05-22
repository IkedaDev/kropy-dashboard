import { CollectionBeforeChangeHook, PayloadRequest } from 'payload'
import { extractID } from '@/utilities/extractID'

/**
 * Función auxiliar para descontar el stock de los productos
 */
async function discountStock(req: PayloadRequest, items: any[]) {
  for (const item of items) {
    const productId = item.product ? extractID(item.product) : null
    if (!productId) continue

    try {
      const product = await req.payload.findByID({
        collection: 'products',
        id: productId,
      })
      console.log({product})
      if (product) {
        const currentStock = product.stock || 0
        const quantityToSubtract = item.quantity || 0
        const newStock = Math.max(0, currentStock - quantityToSubtract)

        if (currentStock < quantityToSubtract) {
          req.payload.logger.warn(
            `Stock insuficiente para el producto "${product.title}" (ID: ${product.id}). ` +
            `Requerido: ${quantityToSubtract}, Disponible: ${currentStock}. Se estableció el stock en 0.`,
          )
        }

        await req.payload.update({
          collection: 'products',
          id: productId,
          data: {
            stock: newStock,
          },
        })
      }
    } catch (err: any) {
      req.payload.logger.error(
        `Error al intentar descontar stock para el producto "${productId}": ${err?.message || err}`,
      )
    }
  }
}

/**
 * Función auxiliar para restaurar el stock de los productos
 */
async function restoreStock(req: PayloadRequest, items: any[]) {
  for (const item of items) {
    const productId = item.product ? extractID(item.product) : null
    if (!productId) continue

    try {
      const product = await req.payload.findByID({
        collection: 'products',
        id: productId,
      })

      if (product) {
        const currentStock = product.stock || 0
        const quantityToAdd = item.quantity || 0
        const newStock = currentStock + quantityToAdd

        await req.payload.update({
          collection: 'products',
          id: productId,
          data: {
            stock: newStock,
          },
        })
      }
    } catch (err: any) {
      req.payload.logger.error(
        `Error al intentar reponer stock para el producto "${productId}": ${err?.message || err}`,
      )
    }
  }
}

/**
 * Hook beforeChange para la colección de Órdenes
 * Gestiona el stock basándose en las transiciones de estado de la orden
 */
export const handleOrderStatusAndStock: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) {
    return data
  }

  const { status } = data
  const isPaidOrShipped = status === 'paid' || status === 'shipped'
  const isCancelled = status === 'cancelled'
  if (operation === 'create') {
    if (isPaidOrShipped) {
      // 1. Si se crea ya pagada o enviada, descontar stock de inmediato
      await discountStock(req, data.items || [])
      data.wasStockDiscounted = true
    } else {
      data.wasStockDiscounted = false
    }
  }

  if (operation === 'update' && originalDoc) {
    const wasDiscounted = originalDoc.wasStockDiscounted === true

    // 2. Transición: Se paga/envía y no se había descontado stock antes
    if (isPaidOrShipped && !wasDiscounted) {
      await discountStock(req, data.items || originalDoc.items || [])
      data.wasStockDiscounted = true
    }
    // 3. Transición: Se cancela y sí se había descontado stock antes (devolución)
    else if (isCancelled && wasDiscounted) {
      await restoreStock(req, originalDoc.items || [])
      data.wasStockDiscounted = false
    }
    // 4. Transición: Vuelve a pendiente y sí se había descontado stock (devolución)
    else if (status === 'pending' && wasDiscounted) {
      await restoreStock(req, originalDoc.items || [])
      data.wasStockDiscounted = false
    }
  }

  return data
}
