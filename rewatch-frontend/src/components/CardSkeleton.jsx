// src/components/CardSkeleton.jsx
import React from "react";

const CardSkeleton = React.memo(() => {
  return (
    <div className="anime-card skeleton-card">
      <div className="skeleton-poster"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-meta"></div>
      </div>
      <div className="skeleton-button"></div>
    </div>
  );
});

CardSkeleton.displayName = "CardSkeleton";

export default CardSkeleton;

