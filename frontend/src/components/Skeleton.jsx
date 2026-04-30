import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-[#2a2d3e]/50 rounded ${className}`}></div>
  );
};

export default Skeleton;
