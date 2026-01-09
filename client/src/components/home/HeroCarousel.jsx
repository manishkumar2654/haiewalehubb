import React from "react";

const FullScreenImage = ({ image }) => {
  return (
    <section className="w-full h-screen flex items-center justify-center bg-white overflow-hidden">
      <img
        src={image.url}
        alt={image.alt || "Full screen"}
        className="max-w-full max-h-full object-contain"
      />
    </section>
  );
};

export default FullScreenImage;
