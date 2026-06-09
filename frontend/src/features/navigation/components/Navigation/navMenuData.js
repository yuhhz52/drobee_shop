import { buildCollectionUrl } from '@shared/utils/slug'

const chunk = (items = [], size = 10) => {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

const PRODUCT_CATEGORY_CODES = new Set([
  'electric',
  'minimotors',
  'kukirin',
  'teverun',
  'rovoron',
  'kuickwheel',
])

export const buildNavMenus = (categories = []) => {
  const categoryMenus = (Array.isArray(categories) ? categories : []).map((c) => {
    const types = PRODUCT_CATEGORY_CODES.has(c?.code)
      ? (c?.categoryTypes || c?.types || []).filter((t) => t?.code !== 'all')
      : []
    const categoryPath = buildCollectionUrl(c)
    const typeLinks = (Array.isArray(types) ? types : []).map((t, tIdx) => ({
      label: t?.name ?? 'Type',
      to: buildCollectionUrl(t, c?.code),
      key: `${c.id}-type-${tIdx}`,
    }))

    const columns = typeLinks.length
      ? chunk(typeLinks, 10).map((links, chunkIdx) => ({
          title: c.name,
          to: categoryPath,
          links,
          key: `${c.id}-col-${chunkIdx}`,
        }))
      : []

    return {
      label: c?.name ?? 'Category',
      to: categoryPath,
      columns,
      key: c.id,
    }
  })

  return [
    ...categoryMenus,
    {
      label: 'Contact',
      to: '/contact',
      columns: [
        {
          links: [
            { label: 'Contact us', to: '/contact', key: 'contact-us' },
            { label: 'Track Order', to: '/account-details/orders', key: 'track-order' },
          ],
          key: 'contact-col',
        },
      ],
      key: 'contact',
    },
  ]
};

export const languages = [
  'English',
  'Français',
  'Español',
  'Italiano',
  'Polski',
  'Deutsch',
];
