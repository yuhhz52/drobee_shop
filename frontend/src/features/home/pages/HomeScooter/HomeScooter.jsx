import React, { useEffect, useState } from 'react';
import { getAllProducts } from '@services/product.service';
import { fetchCollections } from '@services/collection.service';
import { fetchCategories } from '@services/category.service';
import {
  HeroSection,
  CollectionsBand,
  ProductGrid,
  PriorityBanner,
  PromoStrip,
  FeaturedProduct,
  ExpertsReviews,
  SpareParts,
  Newsletter,
  ValueStrip,
  BlogSection,
  ChatWidget,
} from './components';
import './HomeScooter.css';

const fallbackExpertReviews = [
  { title: 'Best Electric Scooters 2025 - We Tested 200+ To Find Out!', videoId: '4UBR-UQbIag' },
  { title: 'Xiaomi 4 Pro 2nd Gen Review 2024', videoId: 'n_q3Z8-DV24' },
  { title: 'Segway Ninebot Max G30P - Full Review', videoId: 'EHnErMI8Cgg' },
  { title: 'Dualtron Thunder - Ultimate Power Scooter Review', videoId: 'Z5DdYqTV8ps' },
  { title: 'Xiaomi M365 Pro - Honest Long Term Review', videoId: 'xQReCpjDZkM' },
  { title: 'Gotrax G4 - Best Budget Electric Scooter 2024', videoId: '4x3w6AmqX_4' },
];

const HomeScooter = () => {
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [powerfulProducts, setPowerfulProducts] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);

  useEffect(() => {
    fetchCollections()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCollections(data);
        }
      })
      .catch(() => {});

    fetchCategories()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});

    getAllProducts({ featured: true, size: 6, sortBy: 'totalSold', sortDir: 'desc' })
      .then((res) => {
        const list = (res.products || []).slice(0, 6);
        if (list.length) {
          setBestSellers(list);
        } else {
          return getAllProducts({ size: 6, sortBy: 'totalSold', sortDir: 'desc' });
        }
      })
      .then((res) => {
        if (res?.products?.length > 0 && bestSellers.length === 0) {
          setBestSellers(res.products.slice(0, 6));
        }
      })
      .catch(() => {});

    getAllProducts({ size: 6, sortBy: 'price', sortDir: 'desc' })
      .then((res) => {
        const products = res.products || [];
        if (products.length) {
          setPowerfulProducts(products.slice(0, 6));
        }
      })
      .catch(() => {});

    getAllProducts({ featured: true, size: 1 })
      .then((res) => {
        const products = res.products || [];
        if (products.length > 0) {
          setFeaturedProduct(products[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="horizon-home">
      <HeroSection />

      <CollectionsBand collections={collections} categories={categories} />

      <ProductGrid
        products={bestSellers}
        title="Best Sellers"
        viewAllLink="/products"
      />

      <PriorityBanner />

      <ProductGrid
        products={powerfulProducts}
        title="Powerful Electric Scooters"
        viewAllLink="/products"
      />

      <PromoStrip />

      <FeaturedProduct product={featuredProduct} />

      <ExpertsReviews reviews={fallbackExpertReviews} />

      <SpareParts />

      <Newsletter />

      <ValueStrip />

      <BlogSection />

      <ChatWidget />
    </div>
  );
};

export default HomeScooter;
