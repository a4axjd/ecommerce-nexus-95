
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Hero carousel data
const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600&auto=format&fit=crop&q=80",
    title: "NEW SEASON",
    subtitle: "Elevate Your Style",
    description: "Discover our latest collection designed for the streets",
    cta: "Shop Collection",
    url: "/products"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&auto=format&fit=crop&q=80",
    title: "EXCLUSIVE DROP",
    subtitle: "Urban Essentials",
    description: "Limited edition pieces that define the culture",
    cta: "Shop Now",
    url: "/products"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&auto=format&fit=crop&q=80",
    title: "STREETWEAR",
    subtitle: "Define Your Identity",
    description: "Bold designs for those who dare to stand out",
    cta: "Explore",
    url: "/products"
  }
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Auto rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    
    return () => clearInterval(interval);
  }, [current]);
  
  const nextSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };
  
  const prevSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  return (
    <div className="relative h-screen max-h-[800px] min-h-[600px] overflow-hidden">
      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === current 
              ? "opacity-100 translate-x-0" 
              : index < current 
                ? "opacity-0 -translate-x-full" 
                : "opacity-0 translate-x-full"
          }`}
        >
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </div>
          
          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-xl">
                <h3 className="text-md md:text-lg font-medium mb-2 text-primary animate-fade-in">{slide.title}</h3>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white animate-fade-in">
                  {slide.subtitle}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 mb-8 animate-fade-in">
                  {slide.description}
                </p>
                <div className="animate-fade-in">
                  <Button asChild size="lg" className="px-8 py-6 h-auto text-lg font-semibold">
                    <Link to={slide.url}>
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation buttons */}
      <div className="absolute bottom-8 right-8 flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevSlide}
          className="h-10 w-10 rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextSlide}
          className="h-10 w-10 rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40 backdrop-blur-sm"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === current ? "w-8 bg-white" : "w-2 bg-white/60"
            }`}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrent(index);
                setTimeout(() => setIsAnimating(false), 700);
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
