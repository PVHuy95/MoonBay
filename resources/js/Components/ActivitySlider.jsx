import React, { useEffect, useState } from 'react';

const ActivitySlider = ({ images, interval = 3500 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className="activity-slider-huy">
      <img
        src={images[current]}
        alt={`Slide ${current + 1}`}
        className="activity-slider-image-huy"
      />
    </div>
  );
};

export default ActivitySlider;
