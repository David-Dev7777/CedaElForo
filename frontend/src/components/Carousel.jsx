import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react'; // Iconos para la navegación

// Datos de ejemplo para el carrusel
const defaultImages = [
   "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
];

const Carousel = ({ 
  images = defaultImages, // Array de URLs de imágenes
  autoSlide = true,      // Deslizamiento automático
  autoSlideInterval = 3000 // Intervalo en ms para el auto-deslizamiento
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función para ir a la imagen anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Función para ir a la imagen siguiente
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Efecto para el auto-deslizamiento
  useEffect(() => {
  if (!autoSlide) return;

  const slideInterval = setInterval(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, autoSlideInterval);

  return () => clearInterval(slideInterval);
}, [autoSlide, autoSlideInterval, images.length]);

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg shadow-xl group">
      {/* Contenedor de las imágenes */}
      <div 
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full shrink-0 flex justify-center items-center bg-gray-100">
  <img
    src={image}
    alt={`Slide ${index + 1}`}
    className="full h-64 object-contain"
  />
</div>
        ))}
      </div>

      {/* Botones de navegación (solo visibles al pasar el ratón en escritorio) */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={prevSlide} 
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={30} />
        </button>
        <button 
          onClick={nextSlide} 
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight size={30} />
        </button>
      </div>

      {/* Indicadores de navegación (bolitas) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentIndex(index)}
            className={`
              p-1 rounded-full bg-white transition-all
              ${index === currentIndex ? 'bg-opacity-100' : 'bg-opacity-50'}
            `}
          >
            <Circle size={10} fill={index === currentIndex ? 'white' : 'transparent'} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;