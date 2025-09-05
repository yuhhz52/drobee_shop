import React from "react";
import { FaInstagram } from "react-icons/fa";
import ig1 from "../assets/images/ig1.jpg";
import ig2 from "../assets/images/ig2.jpg";
import ig3 from "../assets/images/ig3.jpg";
import ig4 from "../assets/images/ig4.jpg";
import ig5 from "../assets/images/ig5.jpg";

const InstagramFollow = () => {
  const images = [ig1, ig2, ig3, ig4, ig5];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-center text-4xl font-medium mb-8">
        @ Theo dõi Instagram
      </h2>
      <div className="flex justify-center flex-wrap gap-6">
        {images.map((src, idx) => (
          <a
            key={idx}
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group w-52 h-64 overflow-hidden shadow-md block"
          >
            {/* Ảnh */}
            <img
              src={src}
              alt={`instagram-${idx}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FaInstagram className="text-white text-4xl" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default InstagramFollow;
