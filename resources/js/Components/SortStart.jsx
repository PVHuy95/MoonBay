import React from "react";
import { FaStar } from "react-icons/fa";

const SortStart = ({ selectedRating, onChange, ratingsCount = {} }) => {
  const handleClick = (rating) => {
    onChange(rating === selectedRating ? null : rating);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      {[5, 4, 3, 2, 1].map((star) => (
        <button
          key={star}
          onClick={() => handleClick(star)}
          className={`flex items-center px-2 py-1 rounded border ${
            selectedRating === star ? "bg-yellow-300" : "bg-white"
          }`}
        >
          {Array.from({ length: star }, (_, i) => (
            <FaStar key={i} color="#FBBF24" />
          ))}
          <span className="ml-1">
            ({ratingsCount[star] || 0} reviews)
          </span>
        </button>
      ))}
    </div>
  );
};

export default SortStart;
