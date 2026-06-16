import React from 'react';
import { Link } from 'react-router-dom';
import ig1 from '@assets/images/ig1.jpg';
import ig2 from '@assets/images/ig2.jpg';
import ig3 from '@assets/images/ig3.jpg';
import './BlogSection.css';

const fallbackBlogItems = [
  {
    title: '10 Best Electric Scooters: From Budget to Extreme Power',
    meta: 'Horizon • Jun 15, 2026',
    image: ig1,
  },
  {
    title: 'How to Choose the Right Electric Scooter for Your Needs',
    meta: 'Horizon • Jun 10, 2026',
    image: ig2,
  },
  {
    title: 'Electric Scooter Maintenance Tips for Long-lasting Performance',
    meta: 'Horizon • Jun 05, 2026',
    image: ig3,
  },
];

const BlogSection = ({ posts = fallbackBlogItems }) => {
  return (
    <section className="horizon-section">
      <div className="horizon-container">
        <div className="horizon-section-head">
          <h2>Blog posts</h2>
          <Link to="/products" className="horizon-link-red">
            View all
          </Link>
        </div>
        <div className="horizon-blog-grid">
          {posts.map((post, index) => (
            <article key={`blog-${index}`} className="horizon-blog-card">
              <img src={post.image} alt="" />
              <h3>{post.title}</h3>
              <p className="horizon-blog-card__meta">{post.meta}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
