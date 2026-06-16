import React from 'react';
import './ValueStrip.css';

const valueProps = [
  { title: 'EU shipping', text: 'All Europe 3 - 7 working days' },
  { title: 'Free helmet', text: 'Horizon protects its riders' },
  { title: '7/7 Support', text: 'Any Question contact us !' },
  { title: 'Secure payments', text: '100% secure checkout' },
];

const ValueStrip = ({ items = valueProps }) => {
  return (
    <section className="horizon-value-strip">
      <div className="horizon-container horizon-value-strip__grid">
        {items.map((prop) => (
          <div key={prop.title}>
            <h4>{prop.title}</h4>
            <p>{prop.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueStrip;
