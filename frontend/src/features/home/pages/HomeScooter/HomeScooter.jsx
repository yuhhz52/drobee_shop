import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiMessageCircle,
} from 'react-icons/fi';
import { getAllProducts } from '@services/product.service';
import { formatPriceEUR } from '@shared/utils/price-format';
import { inferBrand } from '@shared/utils/product-brand';
import { getPrimaryResourceUrl, getProductImages } from '@shared/utils/product-media';
import VepaceProductCard from './VepaceProductCard';
import ig1 from '@assets/images/ig1.jpg';
import ig2 from '@assets/images/ig2.jpg';
import ig3 from '@assets/images/ig3.jpg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HomeScooter.css';

const CDN = 'https://vepace.com/cdn/shop/files';
const CDN_FALLBACK =
  'https://0i1kw6o8mm0dwce9-70714851584.shopifypreview.com/cdn/shop/files';

const heroSlides = [
  {
    image: `${CDN_FALLBACK}/Image_0f80380a-7697-449a-8854-d0435025b891.jpg?v=1761010474&width=1920`,
    link: '/products',
    alt: 'Minimotors Dualtron electric scooters',
  },
  {
    image: `${CDN_FALLBACK}/slide-2_e34d79d6-cbf7-45df-9f5c-5968f93fcbf1.jpg?v=1761010474&width=1920`,
    link: '/products',
    alt: 'Kukirin electric scooters promotion',
  },
  {
    image: `${CDN_FALLBACK}/slide-3_fc65269a-c80d-4266-b926-55eea5292d76.jpg?v=1761010474&width=1920`,
    link: '/products',
    alt: 'Teverun electric scooters',
  },
];

const collections = [
  {
    label: 'Dualtron Electric Scooters',
    link: '/products',
    image: `${CDN}/dualtron-electric-scooters-collection.png?v=1&width=200`,
  },
  {
    label: 'Kukirin Electric Scooters',
    link: '/products',
    image: `${CDN}/kukirin-electric-scooters-collection.png?v=1&width=200`,
  },
  {
    label: 'Teverun Electric Scooters',
    link: '/products',
    image: `${CDN}/teverun-electric-scooters-collection.png?v=1&width=200`,
  },
  {
    label: 'Rovoron Electric Scooters',
    link: '/products',
    image: `${CDN}/rovoron-electric-scooters-collection.png?v=1&width=200`,
  },
  {
    label: 'KuickWheel Electric Scooters',
    link: '/products',
    image: `${CDN}/kuickwheel-electric-scooter-collection.png?v=1&width=200`,
  },
  {
    label: 'Ultra Powerful Electric Scooters',
    link: '/products',
    image: `${CDN}/ultra-powerful-electric-scooter-collection.png?v=1&width=200`,
  },
];

const expertReviews = [
  {
    title: 'Kukirin A1 – Full Review by TestNologie (French Video)',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    title: 'KuKirin T3 – Full Review by Tazkiller85 (French Video)',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    title: 'Kukirin G2 Master vs Other Brands – by TestNologie (French Video)',
    videoId: 'dQw4w9WgXcQ',
  },
];

const featuredImages = [
  `${CDN}/kukirin-g2-electric-scooter-2026-main.jpg?v=1&width=800`,
  `${CDN}/kukirin-g2-vmp-dgt-electric-scooter-2026.jpg?v=1&width=800`,
  `${CDN}/kukirin-g2-electric-scooter-2026-side.jpg?v=1&width=800`,
  `${CDN}/kukirin-g2-electric-scooter-2026-folded.jpg?v=1&width=800`,
  `${CDN}/kukirin-g2-electric-scooter-2026-box.jpg?v=1&width=800`,
];

const blogItems = [
  {
    title: '10 Best KuKirin Electric Scooters: From Budget G2 to Extreme G4 Max',
    meta: 'Infos • Jan 09, 2026',
    image: ig1,
  },
  {
    title:
      'Kukirin vs Dualtron: Which Electric Scooter Brand Really Fits Your Power, Range, Budget?',
    meta: 'Infos • Jan 08, 2026',
    image: ig2,
  },
  {
    title: '10 Best Dualtron Electric Scooters: From Budget TOGO to Extreme X LTD',
    meta: 'Infos • Jan 07, 2026',
    image: ig3,
  },
];

const valueProps = [
  { title: 'EU shipping', text: 'All Europe 3 - 7 working days' },
  { title: 'Free helmet', text: 'VEPACE protects his Riders' },
  { title: '7/7 Support', text: 'Any Question contact us !' },
  { title: 'Secure payments', text: '100% secure checkout' },
];

const initialHome = {
  bestSellers: [],
  powerful: [],
  featured: null,
};

const HomeScooter = () => {
  const [bestSellers, setBestSellers] = useState(initialHome.bestSellers);
  const [powerfulProducts, setPowerfulProducts] = useState(initialHome.powerful);
  const [featuredProduct, setFeaturedProduct] = useState(initialHome.featured);
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [chatOpen, setChatOpen] = useState(true);
  const [expertSlide, setExpertSlide] = useState(0);

  useEffect(() => {
    getAllProducts({ newArrival: true, size: 12 })
      .then((res) => {
        const list = (res.products || []).slice(0, 6);
        if (list.length) setBestSellers(list);
      })
      .catch(() => {});

    getAllProducts({ size: 12 })
      .then((res) => {
        const products = res.products || [];
        if (products.length) {
          setPowerfulProducts(products.slice(0, 6));
          const featured =
            products.find((p) => p.slug?.includes('kukirin-g2')) || products[0];
          setFeaturedProduct(featured);
        }
      })
      .catch(() => {});
  }, []);

  const heroSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5500,
  };

  const featuredProductImages = useMemo(
    () => getProductImages(featuredProduct),
    [featuredProduct]
  );
  const featuredPrimary = useMemo(
    () => getPrimaryResourceUrl(featuredProduct?.productResources),
    [featuredProduct]
  );

  const featuredThumbs =
    featuredProductImages.length > 0
      ? featuredProductImages
      : featuredPrimary
        ? [featuredPrimary, ...featuredImages]
        : featuredImages;

  const mainImage = featuredThumbs[activeThumb] || featuredThumbs[0];

  return (
    <div className="vepace-home">
      <section className="vepace-hero">
        <Slider {...heroSettings}>
          {heroSlides.map((slide, index) => (
            <div key={slide.link + index}>
              <Link to={slide.link} className="vepace-hero__slide">
                <img src={slide.image} alt={slide.alt} loading={index === 0 ? 'eager' : 'lazy'} />
              </Link>
            </div>
          ))}
        </Slider>
      </section>

      <section className="vepace-collections-band">
        <div className="vepace-container">
          <div className="vepace-section-head">
            <h2>Our collections</h2>
            <Link to="/products" className="vepace-link-red">
              View all
            </Link>
          </div>
          <div className="vepace-collections">
            {collections.map((item) => (
              <Link key={item.label} to={item.link} className="vepace-collections__item">
                <div className="vepace-collections__circle">
                  <img
                    src={item.image}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${CDN}/Image_0f80380a-7697-449a-8854-d0435025b891.jpg?width=120`;
                    }}
                  />
                </div>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="vepace-section">
        <div className="vepace-container">
          <div className="vepace-section-head">
            <h2>Best Sellers</h2>
            <Link to="/products" className="vepace-link-red">
              View all
            </Link>
          </div>
          <div className="vepace-product-grid">
            {bestSellers.map((item) => (
              <VepaceProductCard
                key={item.id}
                {...item}
                brand={inferBrand(item.name)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="vepace-priority">
        <div className="vepace-container vepace-priority__inner">
          <div className="vepace-priority__media">
            <span className="vepace-priority__tag">FREE</span>
            <img
              src={`${CDN}/free-helmet-vepace-store.jpg?v=1&width=900`}
              alt="Free helmet with every scooter"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${CDN}/image_12_ee86a61c-fd86-4e36-bbbb-8492fb016128.png?width=900`;
              }}
            />
          </div>
          <div className="vepace-priority__content">
            <h2>Your Ride, Our Priority.</h2>
            <p>
              At Vepace, your safety comes first. That&apos;s why we offer a{' '}
              <strong>free helmet with every electric scooter purchase</strong> — because
              we&apos;re committed to protecting our riders and supporting every journey with
              care and confidence.
            </p>
            <Link to="/products" className="vepace-btn vepace-btn--black">
              Explore Our Scooters
            </Link>
          </div>
        </div>
      </section>

      <section className="vepace-section">
        <div className="vepace-container">
          <div className="vepace-section-head">
            <h2>Powerful Electric Scooters</h2>
            <Link to="/products" className="vepace-link-red">
              View all
            </Link>
          </div>
          <div className="vepace-product-grid">
            {powerfulProducts.map((item) => (
              <VepaceProductCard
                key={item.id}
                {...item}
                brand={inferBrand(item.name)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="vepace-promo-strip">
        <div className="vepace-promo-strip__block vepace-promo-strip__block--dark">
          <p>1-2 year warranty &amp; after-sales service available 7/7</p>
          <Link to="/contact" className="vepace-promo-strip__btn vepace-promo-strip__btn--red">
            Warranty 🛠
          </Link>
        </div>
        <div className="vepace-promo-strip__block vepace-promo-strip__block--red">
          <p>Delivery to all EU countries, 3-7 working days</p>
          <Link to="/contact" className="vepace-promo-strip__btn vepace-promo-strip__btn--dark">
            Shipping ✈
          </Link>
        </div>
      </section>

      <section className="vepace-section vepace-section--featured">
        <div className="vepace-container">
          <div className="vepace-section-head">
            <h2>Featured Electric Scooter</h2>
            <Link
              to={featuredProduct ? `/product/${featuredProduct.slug}` : '/products'}
              className="vepace-link-red"
            >
              View details
            </Link>
          </div>
          <div className="vepace-featured">
            <div className="vepace-featured__gallery">
              <div className="vepace-featured__thumbs">
                {featuredThumbs.slice(0, 5).map((src, index) => (
                  <button
                    key={src + index}
                    type="button"
                    className={activeThumb === index ? 'is-active' : ''}
                    onClick={() => setActiveThumb(index)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
              <div className="vepace-featured__main">
                <img src={mainImage} alt={featuredProduct?.name || 'Featured scooter'} />
                <p className="vepace-featured__zoom-hint">
                  Roll over image to zoom in
                </p>
              </div>
            </div>
            <div className="vepace-featured__info">
              <h3>{featuredProduct?.name || 'Kukirin G2 Electric Scooter 2026'}</h3>
              <div className="vepace-featured__badges">
                <span className="badge badge--green">DGT</span>
                <span className="badge badge--blue">Bestseller</span>
                <span className="badge badge--blue">NEW</span>
                <span className="badge badge--red">- €100,00</span>
              </div>
              <p className="vepace-featured__brand">
                {inferBrand(featuredProduct?.name) || 'KUKIRIN'}
              </p>
              <div className="vepace-featured__rating">★★★★★ 24 reviews</div>
              <p className="vepace-featured__variant-label">Version: G2</p>
              <div className="vepace-featured__variants">
                <button type="button" className="is-active">
                  G2
                </button>
                <button type="button">G2 VMP (DGT)</button>
              </div>
              <div className="vepace-featured__price">
                <span className="label">Price:</span>
                <span className="sale">
                  {formatPriceEUR(featuredProduct?.price ?? 489)}
                </span>
                <span className="regular">{formatPriceEUR(589)}</span>
              </div>
              <div className="vepace-featured__qty">
                <span>Quantity:</span>
                <div className="vepace-qty">
                  <button
                    type="button"
                    aria-label="Decrease"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <FiMinus />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
              <Link
                to={featuredProduct ? `/product/${featuredProduct.slug}` : '/products'}
                className="vepace-btn vepace-btn--black vepace-btn--full"
              >
                Add to cart
              </Link>
              <button type="button" className="vepace-btn vepace-btn--paypal vepace-btn--full">
                Pay with PayPal
              </button>
              <button type="button" className="vepace-featured__more-pay">
                More payment options
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="vepace-section vepace-section--experts">
        <div className="vepace-container">
          <div className="vepace-section-head vepace-section-head--center">
            <div>
              <h2>Tested by Experts</h2>
              <p className="vepace-section-sub">
                Watch honest reviews from YouTube creators and tech reviewers before
                choosing your ride.
              </p>
            </div>
          </div>
          <div className="vepace-experts">
            <button
              type="button"
              className="vepace-experts__arrow"
              aria-label="Previous"
              onClick={() => setExpertSlide((s) => Math.max(0, s - 1))}
            >
              <FiChevronLeft />
            </button>
            <div className="vepace-experts__track">
              {expertReviews.map((review, index) => (
                <a
                  key={review.title}
                  href={`https://www.youtube.com/watch?v=${review.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`vepace-experts__card ${index === expertSlide ? 'is-focus' : ''}`}
                >
                  <div className="vepace-experts__thumb">
                    <img
                      src={`https://img.youtube.com/vi/${review.videoId}/hqdefault.jpg`}
                      alt=""
                    />
                    <span className="vepace-experts__play" aria-hidden />
                  </div>
                  <h3>{review.title}</h3>
                </a>
              ))}
            </div>
            <button
              type="button"
              className="vepace-experts__arrow"
              aria-label="Next"
              onClick={() =>
                setExpertSlide((s) => Math.min(expertReviews.length - 1, s + 1))
              }
            >
              <FiChevronRight />
            </button>
          </div>
          <div className="vepace-experts__dots">
            {expertReviews.map((_, i) => (
              <button
                key={i}
                type="button"
                className={expertSlide === i ? 'is-active' : ''}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setExpertSlide(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="vepace-spare">
        <div className="vepace-container vepace-spare__inner">
          <div>
            <h2>Need Spare Parts?</h2>
            <p>
              Find official spare parts and replacement components, including tires,
              brakes, displays, chargers, and more. Fast shipping and compatible parts
              for your electric scooter.
            </p>
          </div>
          <Link to="/products" className="vepace-btn vepace-btn--outline">
            View Parts
          </Link>
        </div>
      </section>

      <section className="vepace-mid-newsletter">
        <div className="vepace-container vepace-mid-newsletter__inner">
          <h2>Newsletter</h2>
          <p>Join the Vepace Rider Family &amp; Stay Informed</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" aria-label="Email" />
            <button type="submit" className="vepace-btn vepace-btn--red">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <section className="vepace-value-strip">
        <div className="vepace-container vepace-value-strip__grid">
          {valueProps.map((prop) => (
            <div key={prop.title}>
              <h4>{prop.title}</h4>
              <p>{prop.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="vepace-section">
        <div className="vepace-container">
          <div className="vepace-section-head">
            <h2>Blog posts</h2>
            <Link to="/products" className="vepace-link-red">
              View all
            </Link>
          </div>
          <div className="vepace-blog-grid">
            {blogItems.map((post) => (
              <article key={post.title} className="vepace-blog-card">
                <img src={post.image} alt="" />
                <h3>{post.title}</h3>
                <p className="vepace-blog-card__meta">{post.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="vepace-chat-widget">
        {chatOpen && (
          <div className="vepace-chat-widget__bubble">
            <span>👋 Hi! Need any help?</span>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Close">
              ×
            </button>
          </div>
        )}
        <button type="button" className="vepace-chat-widget__btn" aria-label="Chat">
          <FiMessageCircle size={22} />
        </button>
      </div>
    </div>
  );
};

export default HomeScooter;
