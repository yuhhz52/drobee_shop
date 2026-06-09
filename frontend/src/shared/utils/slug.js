/**
 * Converts a string into a URL-friendly slug.
 * Example: "Electric Scooters 25 km/h" -> "electric-scooters-25-kmh"
 * @param {string} str - The input string
 * @returns {string} - URL-safe slug
 */
export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Builds a collection URL from category or categoryType data.
 * CategoryType codes are used directly as slugs, matching the DB collections table.
 * @param {object} item - Category or CategoryType object
 * @param {string} [parentCategoryCode] - Parent category code for type items
 * @returns {string} - URL path like "/collections/kukirin-g2-pro"
 */
export const buildCollectionUrl = (item, parentCategoryCode) => {
  if (!item) return '/collections/electric-scooters'

  const itemCode = item?.code || slugify(item?.name || '')

  if (itemCode === 'electric' || itemCode === 'all-electric-scooters') {
    return '/collections/electric-scooters'
  }

  if (itemCode === 'new-arrivals') {
    return '/collections/new-arrivals'
  }

  if (itemCode === 'sale' || itemCode === 'sales-promotions') {
    return '/collections/sale'
  }

  // Use type.code directly as the slug (e.g. "kukirin-g2-pro")
  // No prefix needed - slugs in DB are stored as type codes directly
  return `/collections/${itemCode}`
}
