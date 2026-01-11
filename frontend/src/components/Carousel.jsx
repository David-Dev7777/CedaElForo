import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react'; // Iconos para la navegación

// Datos de ejemplo para el carrusel


export default function Carousel({ images = [], autoSlide = false, autoSlideInterval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesCount = images.length;
  const prevSlide = () => {
    setCurrentIndex((currentIndex - 1 + slidesCount) % slidesCount);
  };

  const nextSlide = () => {
    setCurrentIndex((currentIndex + 1) % slidesCount);
  };  
 useEffect(() => {
  if (!autoSlide) return;
  
  const slideInterval = setInterval(() => {
    setCurrentIndex((curr) => (curr + 1) % images.length);
  }, autoSlideInterval);

  return () => clearInterval(slideInterval);
}, [autoSlide, autoSlideInterval, images.length]);

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img src={image} alt={`Slide ${index}`} className="w-full h-64 object-cover" />
          </div>
        ))}
      </div>
      {/* Botones de navegación */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
      >
        <ChevronRight />
      </button>
      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">  
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`p-1 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-400'}`}
          >
            <Circle size={12} />
          </button>
        ))} 
      </div>
    </div>
  );
}