import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { FiArrowRight } from "react-icons/fi";
import { getAllProducts } from "../../api/fetchProducts";
import ProductCard from "../ProductListPage/ProductCard.jsx";
import ig1 from "../../assets/images/ig1.jpg";
import ig2 from "../../assets/images/ig2.jpg";
import ig3 from "../../assets/images/ig3.jpg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HomeScooter.css";

const CDN =
  "https://0i1kw6o8mm0dwce9-70714851584.shopifypreview.com/cdn/shop/files";

const heroSlides = [
  {
    price: "$395.70",
    title: "B6 Electric Scooter",
    description:
      "Powerful Motor & Long Battery Life - The 500W powerful electric brushless hub motor allows for speeds up to 19mph.",
    image: `${CDN}/Image_0f80380a-7697-449a-8854-d0435025b891.jpg?v=1761010474&width=1920`,
  },
  {
    price: "$397.07",
    title: "Ninebot Mini Pro",
    description:
      "Lightweight build, smart app control, and stable ride support for daily commutes.",
    image: `${CDN}/slide-2_e34d79d6-cbf7-45df-9f5c-5968f93fcbf1.jpg?v=1761010474&width=1920`,
  },
  {
    price: "$395.07",
    title: "G3 Electric Scooter",
    description:
      "High performance torque with quick folding design built for city travel.",
    image: `${CDN}/slide-3_fc65269a-c80d-4266-b926-55eea5292d76.jpg?v=1761010474&width=1920`,
  },
];

const heroFeatures = [
  { label: "WIRELESS CONNECT" },
  { label: "POWERFULL BATTERY" },
  { label: "LONG RANGE" },
];

const bundleItems = [
  {
    id: "bundle-1",
    label: "B6 Electric Scooter",
    price: 39570,
    image: `${CDN}/61gBw6ZudWL._AC_SL1500.jpg?v=1761008814&width=244`,
  },
  {
    id: "bundle-2",
    label: "FullFace Helmet",
    price: 10623,
    image: `${CDN}/61gBw6ZudWL._AC_SL1500.jpg?v=1761008814&width=244`,
  },
  {
    id: "bundle-3",
    label: "Scooter Light Set",
    price: 673,
    image: `${CDN}/61gBw6ZudWL._AC_SL1500.jpg?v=1761008814&width=244`,
  },
  {
    id: "bundle-4",
    label: "Scooter Chain Lock",
    price: 619,
    image: `${CDN}/61gBw6ZudWL._AC_SL1500.jpg?v=1761008814&width=244`,
  },
];

const newsItems = [
  {
    title: "Ergonomic Home Office Corner Setup Tips",
    meta: "By admin on Nov 03",
    image: ig1,
  },
  {
    title: "Ergonomic Chair for Home Office",
    meta: "By admin on Nov 03",
    image: ig2,
  },
  {
    title: "Sit soft and comfortable",
    meta: "By admin on Nov 03",
    image: ig3,
  },
];

const benefits = [
  { title: "Fast Delivery", text: "Free shipping on all US orders" },
  { title: "Safe Payment", text: "We ensure secure payment with PEV" },
  { title: "24/7 Online Support", text: "24 hours a day, 7 days a week" },
  { title: "Free Returns", text: "Simply return it within 30 days" },
];

const HomeScooter = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [bundleSelection, setBundleSelection] = useState(
    bundleItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );

  useEffect(() => {
    getAllProducts({ newArrival: true, size: 8 })
      .then((res) => setNewProducts(res.products || []))
      .catch(() => setNewProducts([]));
    getAllProducts({ size: 8 })
      .then((res) => setHotProducts(res.products || []))
      .catch(() => setHotProducts([]));
  }, []);

  const bundleTotal = useMemo(() => {
    return bundleItems.reduce((total, item) => {
      return bundleSelection[item.id] ? total + item.price : total;
    }, 0);
  }, [bundleSelection]);

  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <div className="kalles-home">
      <section className="kalles-hero">
        <Slider {...sliderSettings}>
          {heroSlides.map((slide) => (
            <div key={slide.title} className="kalles-hero__slide">
              <img
                className="kalles-hero__bg"
                src={slide.image}
                alt=""
                loading="eager"
              />
              <div className="kalles-hero__content">
                <p className="kalles-hero__price">{slide.price}</p>
                <h1>{slide.title}</h1>
                <p className="kalles-hero__desc">{slide.description}</p>
                <div className="kalles-hero__features">
                  {heroFeatures.map((feature) => (
                    <span key={feature.label} className="kalles-hero__feature">
                      <span className="kalles-hero__feature-dot" />
                      {feature.label}
                    </span>
                  ))}
                </div>
                <Link to="/shops" className="kalles-button">
                  Shopping Now
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <section className="kalles-section">
        <div className="kalles-section__header">
          <h2>New In Products</h2>
          <p>
            Here&apos;s some of our most popular products people are in love with.
          </p>
        </div>
        <div className="kalles-grid">
          {newProducts.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
        <div className="kalles-center">
          <Link to="/new-arrivals" className="kalles-button kalles-button--outline">
            Load more
          </Link>
        </div>
      </section>

      <section className="kalles-featured-banner">
        <img
          className="kalles-featured-banner__bg"
          src={`${CDN}/image_12_ee86a61c-fd86-4e36-bbbb-8492fb016128.png?v=1761010478&width=1920`}
          alt=""
        />
        <div className="kalles-featured-banner__content">
          <div className="kalles-featured-banner__left">
            <p className="kalles-featured-banner__label">Just</p>
            <h3>$395.70</h3>
            <Link to="/shops" className="kalles-button kalles-button--dark">
              Order now
            </Link>
          </div>
          <div className="kalles-featured-banner__stats">
            <div>
              <span>Top Speed</span>
              <strong>60mph</strong>
            </div>
            <div>
              <span>Range</span>
              <strong>65-70miles</strong>
            </div>
            <div>
              <span>Power</span>
              <strong>70kW</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="kalles-section">
        <div className="kalles-section__header">
          <h2>Get Big Deal Buy Them Together</h2>
          <p>
            Here&apos;s some of our most popular products people are in love with.
          </p>
        </div>
        <div className="kalles-bundle">
          <div className="kalles-bundle__items">
            {bundleItems.map((item, index) => (
              <div key={item.id} className="kalles-bundle__item">
                <img src={item.image} alt={item.label} />
                {index < bundleItems.length - 1 && (
                  <span className="kalles-bundle__plus">+</span>
                )}
              </div>
            ))}
          </div>
          <div className="kalles-bundle__summary">
            <p>Total Price:</p>
            <strong>${(bundleTotal / 100).toFixed(2)}</strong>
            <button className="kalles-button" type="button">
              Add selected to cart
            </button>
          </div>
        </div>
        <div className="kalles-bundle__list">
          {bundleItems.map((item) => (
            <label key={item.id} className="kalles-bundle__check">
              <input
                type="checkbox"
                checked={bundleSelection[item.id]}
                onChange={() =>
                  setBundleSelection((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }
              />
              <span>
                <strong>This item:</strong> {item.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="kalles-section">
        <div className="kalles-section__header">
          <h2>Hot Products</h2>
          <p>
            Here&apos;s some of our most popular products people are in love with.
          </p>
        </div>
        <div className="kalles-grid">
          {hotProducts.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </section>

      <section className="kalles-section kalles-section--news">
        <div className="kalles-section__header">
          <h2>Latest News</h2>
          <p>The freshest and most exciting news about fashion trending.</p>
        </div>
        <div className="kalles-news">
          {newsItems.map((news) => (
            <article key={news.title} className="kalles-news__card">
              <img src={news.image} alt={news.title} />
              <p className="kalles-news__meta">{news.meta}</p>
              <h3>{news.title}</h3>
              <p>
                Typography is the work of typesetters, compositors, typographers,
                graphic designers, art directors, manga artists...
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="kalles-newsletter">
        <h2>Signup to be the first to hear about exclusive deals</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter email address" />
          <button className="kalles-button kalles-button--dark" type="submit">
            Subscribe
          </button>
        </form>
      </section>

      <section className="kalles-benefits">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="kalles-benefit">
            <div className="kalles-benefit__icon" aria-hidden="true" />
            <div>
              <h4>{benefit.title}</h4>
              <p>{benefit.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomeScooter;
