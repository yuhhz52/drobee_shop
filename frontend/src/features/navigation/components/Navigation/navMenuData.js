import { buildCollectionUrl } from '@shared/utils/slug'

const chunk = (items = [], size = 10) => {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

const FALLBACK_LAYOUTS = {
  electric: '2col',
  minimotors: 'mega',
  kukirin: '2col',
  teverun: 'wide-col',
  rovoron: '2col',
  kuickwheel: '2col',
}

export const buildNavMenus = (categories = []) => {
  const categoryMenus = (Array.isArray(categories) ? categories : []).map((c) => {
    const hasLayout = c?.dropdownLayout ?? FALLBACK_LAYOUTS[c?.code]
    if (!hasLayout) return null

    const types = (c?.categoryTypes || c?.types || []).filter((t) => t?.code !== 'all')
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
      layout: c?.dropdownLayout ?? FALLBACK_LAYOUTS[c?.code] ?? '1col',
      columns,
      key: c.id,
    }
  }).filter(Boolean)

  return [
    ...categoryMenus,
    {
      label: 'Contact',
      to: '/contact',
      layout: 'align-right',
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
  'Tiếng Việt',
];
