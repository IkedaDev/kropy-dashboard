import { CollectionBeforeValidateHook } from 'payload'

function parseFlatAddress(addressStr: string) {
  const parts = addressStr.split(',').map(p => p.trim()).filter(Boolean)
  let streetPart = addressStr
  let number = '.'
  let city = 'Sin Comuna'
  let state = 'Sin Región'
  let apartmentOrOffice = ''

  if (parts.length >= 4) {
    streetPart = parts[0]
    apartmentOrOffice = parts[1]
    city = parts[2]
    state = parts[3]
  } else if (parts.length === 3) {
    streetPart = parts[0]
    city = parts[1]
    state = parts[2]
  } else if (parts.length === 2) {
    streetPart = parts[0]
    city = parts[1]
  }

  const match = streetPart.match(/^(.*?)\s+(\d+)(?:\s+(.*))?$/)
  let street = streetPart
  if (match) {
    street = match[1].trim()
    number = match[2].trim()
    if (match[3]) {
      const extra = match[3].trim()
      apartmentOrOffice = apartmentOrOffice ? `${apartmentOrOffice} ${extra}` : extra
    }
  }

  return {
    label: 'Principal',
    street: street || 'Sin Calle',
    number: number || '.',
    apartmentOrOffice: apartmentOrOffice || undefined,
    city: city || 'Sin Comuna',
    state: state || 'Sin Región',
    isDefault: true,
  }
}

function formatAddress(addr: any): string {
  const streetAndNum = `${addr.street || ''} ${addr.number || ''}`.trim()
  const apt = addr.apartmentOrOffice ? `, Dpto/Oficina ${addr.apartmentOrOffice}` : ''
  const city = addr.city ? `, ${addr.city}` : ''
  const state = addr.state ? `, ${addr.state}` : ''
  return `${streetAndNum}${apt}${city}${state}`.trim()
}

export const handleDefaultAddress: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
}) => {
  if (!data) return data

  const originalAddresses = originalDoc?.addresses || []
  const incomingAddresses = data.addresses || []

  // 1. If addresses array is empty but flat address is provided, populate addresses array
  if (incomingAddresses.length === 0 && data.address) {
    data.addresses = [parseFlatAddress(data.address)]
    return data
  }

  // 2. Manage default address selection
  let defaultIndex = -1

  // Find if any address was newly set to isDefault: true
  for (let i = 0; i < incomingAddresses.length; i++) {
    const incomingItem = incomingAddresses[i]
    const originalItem = originalAddresses[i]
    if (incomingItem?.isDefault && !originalItem?.isDefault) {
      defaultIndex = i
      break
    }
  }

  // If no new item was explicitly set to default, find the first one that is marked default
  if (defaultIndex === -1) {
    defaultIndex = incomingAddresses.findIndex((addr: any) => addr?.isDefault)
  }

  // If still no item is marked default, and the list is not empty, default to the first one
  if (defaultIndex === -1 && incomingAddresses.length > 0) {
    defaultIndex = 0
  }

  // Update isDefault state and mirror to flat address
  if (incomingAddresses.length > 0) {
    data.addresses = incomingAddresses.map((addr: any, idx: number) => ({
      ...addr,
      isDefault: idx === defaultIndex,
    }))

    const defaultAddress = data.addresses[defaultIndex]
    data.address = formatAddress(defaultAddress)
  } else {
    data.address = null
  }

  return data
}
