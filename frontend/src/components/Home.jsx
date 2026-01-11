// src/page/Home.jsx
import React from "react";
import Hero from "../components/Hero.jsx";
import Carousel from "../components/Carousel.jsx";
import Imagen1 from "../assets/imagenes/europe-9205818_1280.jpg";
import Imagen2 from "../assets/imagenes/glasses-9864287_1280.jpg"
import Imagen3 from "../assets/imagenes/snow-7704922_1280.jpg"

const Slides = [
    Imagen1,
    Imagen2,
    Imagen3
];

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <div className="max-w-6xl mx-auto mt-10"> {/* Contenedor para dar margen y centrar */}
        <Carousel 
          images={Slides} 
          autoSlide={true} 
          autoSlideInterval={4000} 
        />
      </div>
    </div>
  );
}