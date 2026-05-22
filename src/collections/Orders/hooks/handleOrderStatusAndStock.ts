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
      if (product) {
        const quantityToSubtract = item.quantity || 0
        const variantId = item.variantId

        if (product.hasVariants && variantId) {
          const variants = product.variants || []
          const variantIndex = variants.findIndex((v: any) => v.id === variantId)

          if (variantIndex !== -1) {
            const variant = variants[variantIndex]
            const currentVarStock = variant.stock || 0
            const newVarStock = Math.max(0, currentVarStock - quantityToSubtract)

            if (currentVarStock < quantityToSubtract) {
              req.payload.logger.warn(
                `Stock insuficiente para la variante "${variant.variantName}" (ID: ${variantId}) del producto "${product.title}" (ID: ${product.id}). ` +
                  `Requerido: ${quantityToSubtract}, Disponible: ${currentVarStock}. Se estableció el stock en 0.`,
              )
            }

            // Actualizar la lista de variantes
            const updatedVariants = [...variants]
            updatedVariants[variantIndex] = {
              ...variant,
              stock: newVarStock,
            }

            await req.payload.update({
              collection: 'products',
              id: productId,
              data: {
                variants: updatedVariants,
              },
            })
            continue // Ya procesamos esta variante, pasar al siguiente item
          } else {
            req.payload.logger.warn(
              `Variante con ID "${variantId}" no encontrada en el producto "${product.title}" (ID: ${product.id}). Se aplicará el descuento al stock global.`,
            )
          }
        }

        // Comportamiento base (stock global)
        const currentStock = product.stock || 0
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
        const quantityToAdd = item.quantity || 0
        const variantId = item.variantId

        if (product.hasVariants && variantId) {
          const variants = product.variants || []
          const variantIndex = variants.findIndex((v: any) => v.id === variantId)

          if (variantIndex !== -1) {
            const variant = variants[variantIndex]
            const currentVarStock = variant.stock || 0
            const newVarStock = currentVarStock + quantityToAdd

            // Actualizar la lista de variantes
            const updatedVariants = [...variants]
            updatedVariants[variantIndex] = {
              ...variant,
              stock: newVarStock,
            }

            await req.payload.update({
              collection: 'products',
              id: productId,
              data: {
                variants: updatedVariants,
              },
            })
            continue // Ya procesamos esta variante, pasar al siguiente item
          } else {
            req.payload.logger.warn(
              `Variante con ID "${variantId}" no encontrada al intentar restaurar stock en el producto "${product.title}" (ID: ${product.id}). Se aplicará al stock global.`,
            )
          }
        }

        // Comportamiento base (stock global)
        const currentStock = product.stock || 0
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
 * Función auxiliar para incrementar el contador de uso de un cupón
 */
async function incrementCouponUsage(req: PayloadRequest, discountId: string | null) {
  if (!discountId) return
  try {
    const discount = await req.payload.findByID({
      collection: 'discounts',
      id: discountId,
    })
    if (discount) {
      const usageCount = discount.usageCount || 0
      const usageLimit = discount.usageLimit

      if (usageLimit && usageCount >= usageLimit) {
        req.payload.logger.warn(
          `El cupón "${discount.code}" (ID: ${discount.id}) ha superado su límite de usos de ${usageLimit}.`,
        )
      }

      await req.payload.update({
        collection: 'discounts',
        id: discountId,
        data: {
          usageCount: usageCount + 1,
        },
      })
    }
  } catch (err: any) {
    req.payload.logger.error(
      `Error al intentar incrementar el uso del cupón "${discountId}": ${err?.message || err}`,
    )
  }
}

/**
 * Función auxiliar para decrementar el contador de uso de un cupón
 */
async function decrementCouponUsage(req: PayloadRequest, discountId: string | null) {
  if (!discountId) return
  try {
    const discount = await req.payload.findByID({
      collection: 'discounts',
      id: discountId,
    })
    if (discount) {
      const usageCount = discount.usageCount || 0
      await req.payload.update({
        collection: 'discounts',
        id: discountId,
        data: {
          usageCount: Math.max(0, usageCount - 1),
        },
      })
    }
  } catch (err: any) {
    req.payload.logger.error(
      `Error al intentar decrementar el uso del cupón "${discountId}": ${err?.message || err}`,
    )
  }
}

/**
 * Hook beforeChange para la colección de Órdenes
 * Gestiona el stock y el uso de cupones basándose en las transiciones de estado de la orden
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

  // --- 1. GESTIÓN DE STOCK ---
  if (operation === 'create') {
    if (isPaidOrShipped) {
      await discountStock(req, data.items || [])
      data.wasStockDiscounted = true
    } else {
      data.wasStockDiscounted = false
    }
  }

  if (operation === 'update' && originalDoc) {
    const wasDiscounted = originalDoc.wasStockDiscounted === true

    if (isPaidOrShipped && !wasDiscounted) {
      await discountStock(req, data.items || originalDoc.items || [])
      data.wasStockDiscounted = true
    } else if (isCancelled && wasDiscounted) {
      await restoreStock(req, originalDoc.items || [])
      data.wasStockDiscounted = false
    } else if (status === 'pending' && wasDiscounted) {
      await restoreStock(req, originalDoc.items || [])
      data.wasStockDiscounted = false
    }
  }

  // --- 2. GESTIÓN DE CONTADORES DE CUPONES ---
  const discountId = data.discountCode
    ? extractID(data.discountCode)
    : originalDoc?.discountCode
      ? extractID(originalDoc.discountCode)
      : null

  if (operation === 'create') {
    if (isPaidOrShipped && discountId) {
      await incrementCouponUsage(req, discountId)
      data.wasCouponCounted = true
    } else {
      data.wasCouponCounted = false
    }
  }

  if (operation === 'update' && originalDoc) {
    const wasCouponCounted = originalDoc.wasCouponCounted === true
    const originalDiscountId = originalDoc.discountCode ? extractID(originalDoc.discountCode) : null

    if (isPaidOrShipped && !wasCouponCounted && discountId) {
      await incrementCouponUsage(req, discountId)
      data.wasCouponCounted = true
    } else if (
      (isCancelled || status === 'pending') &&
      wasCouponCounted &&
      originalDiscountId
    ) {
      await decrementCouponUsage(req, originalDiscountId)
      data.wasCouponCounted = false
    }
  }

  return data
}

