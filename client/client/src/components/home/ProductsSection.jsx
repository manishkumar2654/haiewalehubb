import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

const ProductsSection = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const scrollContainerRef = useRef(null);
  const location = useLocation();

  // Fetch categories, subcategories, and all products initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes, productsRes] =
          await Promise.all([
            api.get("/product-categories"),
            api.get("/subcategories"),
            api.get("/products"),
          ]);
        setProductCategories(categoriesRes.data);
        setSubcategories(subcategoriesRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error("Failed to load products section data", error);
      }
    };
    fetchData();
  }, []);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  // Filter subcategories for selected category
  const filteredSubcategories = selectedCategory
    ? subcategories.filter(
        (sub) =>
          sub.productCategory?._id === selectedCategory._id ||
          sub.productCategory === selectedCategory._id
      )
    : [];

  // Derived filtered list
  const displayedProducts = products.filter((p) => {
    // No category selected => show all products
    if (!selectedCategory) return true;

    // Category selected but no subcategory => show all products in that category
    if (selectedCategory && !selectedSubcategory) {
      return (
        p.productCategory?._id === selectedCategory._id ||
        p.productCategory === selectedCategory._id
      );
    }

    // Both category + subcategory selected => filter by subcategory
    return (
      p.subcategory?._id === selectedSubcategory._id ||
      p.subcategory === selectedSubcategory._id
    );
  });

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 to-amber-50 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-rose-200/20 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-amber-200/20 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-[philosopher] mb-4">
            <span className="text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow">
              {location.pathname === "/" ? "OUR PRODUCTS" : "EXPLORE PRODUCTS"}
            </span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-rose-400/50 to-amber-400/50 mx-auto"></div>
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide mb-4">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-[poppins] ${
              !selectedCategory
                ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                : "bg-white/90 text-rose-900 hover:bg-white shadow-md"
            } transition-all duration-300`}
          >
            All
          </button>
          {productCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-[poppins] ${
                selectedCategory?._id === category._id
                  ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                  : "bg-white/90 text-rose-900 hover:bg-white shadow-md"
              } transition-all duration-300`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Subcategory Filter */}
        {selectedCategory && filteredSubcategories.length > 0 && (
          <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide mb-8">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-[poppins] ${
                !selectedSubcategory
                  ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                  : "bg-white/90 text-rose-900 hover:bg-white shadow-md"
              } transition-all duration-300`}
            >
              All Subcategories
            </button>
            {filteredSubcategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 rounded-full text-xs font-[poppins] ${
                  selectedSubcategory?._id === sub._id
                    ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                    : "bg-white/90 text-rose-900 hover:bg-white shadow-md"
                } transition-all duration-300`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-10 bg-white/80 backdrop-blur-sm rounded-xl max-w-md mx-auto p-8 shadow-lg border border-white/30">
            <h3 className="text-xl font-medium font-[poppins]">
              <span className="text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow">
                {selectedSubcategory
                  ? `No products available in ${selectedSubcategory.name} subcategory`
                  : selectedCategory
                  ? `No products available in ${selectedCategory.name} category`
                  : "No products available"}
              </span>
            </h3>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hidden sm:flex items-center justify-center border border-white/30 hover:shadow-xl"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-rose-900" />
            </button>

            <button
              onClick={scrollRight}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hidden sm:flex items-center justify-center border border-white/30 hover:shadow-xl"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-rose-900" />
            </button>

            {/* Scrollable Products Cards */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide"
            >
              <div className="flex space-x-6">
                {displayedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex-shrink-0 w-72 sm:w-80 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 bg-white/90 backdrop-blur-sm"
                  >
                    <div className="h-72 overflow-hidden relative group">
                      <img
                        src={product.images?.[0] || "/default-product.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-[poppins] font-medium mb-3">
                        <span className="text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow">
                          {product.name}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 font-[poppins]">
                        {product.description}
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-[poppins] text-sm">
                          <span className="text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </span>
                        <span className="font-[poppins] text-sm">
                          <span className="text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow">
                            Stock: {product.stock}
                          </span>
                        </span>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Link to={`/store`} className="flex-1">
                          <button className="w-full font-[poppins] text-sm py-3 bg-rose-900 text-white rounded-lg hover:shadow-lg transition-all duration-300 shadow-md">
                            Order
                          </button>
                        </Link>
                        <Link
                          to={`/products/${product._id}`}
                          className="flex-1"
                        >
                          <button className="w-full font-[poppins] text-sm py-3 bg-white border border-rose-900 text-rose-900 rounded-lg hover:bg-rose-900 hover:text-white transition-all duration-300 shadow-md">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add this to your global CSS or CSS-in-JS */}
      <style jsx global>{`
        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-flow {
          animation: gradientFlow 6s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default ProductsSection;
