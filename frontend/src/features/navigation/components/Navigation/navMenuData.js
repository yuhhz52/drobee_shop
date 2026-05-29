const chunk = (items = [], size = 10) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

export const buildNavMenus = (categories = []) => {
  const categoryMenus = (Array.isArray(categories) ? categories : []).map((c) => {
    const types = c?.categoryTypes || c?.types || [];
    const typeLinks = (Array.isArray(types) ? types : []).map((t) => ({
      label: t?.name ?? 'Type',
      to: `/products?categoryId=${c.id}&typeId=${t.id}`,
    }));

    const columns = typeLinks.length
      ? chunk(typeLinks, 10).map((links) => ({ title: c.name, to: `/products?categoryId=${c.id}`, links }))
      : [];

    return {
      label: c?.name ?? 'Category',
      to: `/products?categoryId=${c.id}`,
      columns,
    };
  });

  return [
    ...categoryMenus,
    {
      label: 'Contact',
      to: '/contact',
      columns: [
        {
          links: [
            { label: 'Contact us', to: '/contact' },
            { label: 'Track Order', to: '/account-details/orders' },
          ],
        },
      ],
    },
  ];
};

export const languages = [
  'English',
  'Français',
  'Español',
  'Italiano',
  'Polski',
  'Deutsch',
];
