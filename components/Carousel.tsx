'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface CarouselProps {
  images: string[];
  autoSlideInterval?: number;
  className?: string;
}

export default function Carousel({ 
  images, 
  autoSlideInterval = 3000, 
  className = '' 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHovered && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, autoSlideInterval);

      return () => clearInterval(interval);
    }
  }, [images.length, autoSlideInterval, isHovered]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Mouse handlers for desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStart) {
      setTouchEnd(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (images.length === 0) {
    return <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">No images</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className} cursor-grab active:cursor-grabbing select-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Images */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <Image
              src={image}
              alt={`FPT University ${index + 1}`}
              width={800}
              height={500}
              className="w-full h-64 md:h-80 lg:h-96 object-cover pointer-events-none"
              priority={index === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white scale-110' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
