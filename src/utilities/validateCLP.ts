import { Validate } from 'payload'

/**
 * Validador genérico para montos en pesos chilenos (CLP)
 * En Chile, la moneda CLP no admite decimales.
 */
export const validateCLPAmount = (required: boolean = false): Validate => {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      if (required) {
        return 'Este campo es obligatorio.'
      }
      return true
    }

    const num = Number(value)
    if (isNaN(num)) {
      return 'Debe ser un número válido.'
    }

    if (num < 0) {
      return 'El monto debe ser mayor o igual a 0.'
    }

    if (!Number.isInteger(num)) {
      return 'El monto en CLP debe ser un número entero (no se admiten decimales).'
    }

    return true
  }
}

/**
 * Validador específico para el valor del descuento en cupones
 * Si el tipo de descuento es "Monto Fijo", debe ser entero (CLP).
 * Si es "Porcentaje", puede tener decimales pero debe estar entre 0% y 100%.
 */
export const validateDiscountValue: Validate = (value, { siblingData }) => {
  if (value === undefined || value === null || value === '') {
    return 'Este campo es obligatorio.'
  }

  const num = Number(value)
  if (isNaN(num)) {
    return 'Debe ser un número válido.'
  }

  if (num < 0) {
    return 'El valor debe ser mayor o igual a 0.'
  }

  const discountType = siblingData?.type || 'percentage'
  if (discountType === 'fixed') {
    if (!Number.isInteger(num)) {
      return 'Para cupones de monto fijo (CLP), el valor debe ser un número entero.'
    }
  } else if (discountType === 'percentage') {
    if (num > 100) {
      return 'El porcentaje de descuento no puede ser mayor al 100%.'
    }
  }

  return true
}
