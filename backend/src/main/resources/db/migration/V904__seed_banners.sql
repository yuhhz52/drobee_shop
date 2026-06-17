-- ════════════════════════════════════════════════════════════════════════
-- V904: Seed initial banners for storefront homepage
-- Created after V901/V902 conflict — keep seed data in dedicated migration
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO banners (title, image_url, link_url, alt_text, display_order, active)
VALUES ('Banner 1', 'https://vepace.com/cdn/shop/files/dualtron_minimotors_cover_1c8edb5b-588d-44f0-844d-008069aa3e60.png?v=1753893881&width=2000', '/products', 'Slide 1', 1, true),
       ('Banner 2', 'https://cdn.globber.com/content/2023/07/Globber-scooters-summer-fun.jpg', '/products', 'Slide 2', 2, true);
