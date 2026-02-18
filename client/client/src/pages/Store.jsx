import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Store = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, subRes, prodRes] = await Promise.all([
        api.get("/product-categories"),
        api.get("/subcategories"),
        api.get("/products"),
      ]);
      setCategories(catRes.data);
      setSubcategories(subRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      addToast("Failed to load store data", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubcategories = selectedCategory
    ? subcategories.filter(
        (s) =>
          s.productCategory?._id === selectedCategory._id ||
          s.productCategory === selectedCategory._id
      )
    : [];

  const displayedProducts = products.filter((p) => {
    if (!selectedCategory) return true;
    if (selectedCategory && !selectedSubcategory) {
      return (
        p.productCategory?._id === selectedCategory._id ||
        p.productCategory === selectedCategory._id
      );
    }
    return (
      p.subcategory?._id === selectedSubcategory._id ||
      p.subcategory === selectedSubcategory._id
    );
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = displayedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(displayedProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const addToCart = async (productId) => {
    if (!user) {
      addToast("Please login to add items to cart", "error");
      return;
    }
    try {
      await api.post("/cart", { product: productId, quantity: 1 });
      addToast("Added to cart", "success");
    } catch (err) {
      addToast("Failed to add to cart", "error");
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-lg">
        <div className="bg-white/30 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-12 shadow-2xl max-w-2xl mx-4">
          <div className="text-center">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-[philosopher] mb-6 text-white drop-shadow-2xl">
              Coming Soon
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-white/60 to-white/30 mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-white/95 max-w-lg mx-auto font-[poppins] mb-8 drop-shadow-lg">
              Our online store is currently under development. We're working
              hard to bring you an amazing shopping experience!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-8 py-3 bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-full text-white font-[poppins] text-lg hover:bg-white/40 transition-all duration-300 hover:scale-105"
                onClick={() => (window.location.href = "/")}
              >
                Return Home
              </button>
              <button
                className="px-8 py-3 bg-gradient-to-r from-rose-900/80 to-amber-800/80 backdrop-blur-sm border-2 border-white/40 rounded-full text-white font-[poppins] text-lg hover:from-rose-900 hover:to-amber-800 transition-all duration-300 hover:scale-105"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/70 to-amber-900/50 z-10"></div>
        <img
          src="/productsectionheroimg.png"
          alt="Store products"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-6 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[philosopher] mb-6 text-white drop-shadow-lg">
              Our Product Collection
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto font-[poppins] drop-shadow-md">
              Discover our premium selection of handcrafted products, carefully
              curated for your lifestyle.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-br from-rose-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-rose-200/20 blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-amber-200/20 blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-[philosopher] mb-4">
              <span className="text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow">
                Browse Our Collection
              </span>
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-rose-400/50 to-amber-400/50 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto font-[poppins]">
              Filter by category to find exactly what you're looking for
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 px-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-[poppins] transition-all duration-300 ${
                !selectedCategory
                  ? "text-white shadow-lg bg-gradient-to-r from-rose-900 to-amber-800"
                  : "bg-white text-rose-900 hover:bg-rose-50 shadow-md border border-rose-100"
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => {
                  setSelectedCategory(c);
                  setSelectedSubcategory(null);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-[poppins] transition-all duration-300 ${
                  selectedCategory?._id === c._id
                    ? "text-white shadow-lg bg-gradient-to-r from-rose-900 to-amber-800"
                    : "bg-white text-rose-900 hover:bg-rose-50 shadow-md border border-rose-100"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Subcategories */}
          {selectedCategory && filteredSubcategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10 px-2">
              <button
                onClick={() => {
                  setSelectedSubcategory(null);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-[poppins] transition-all duration-300 ${
                  !selectedSubcategory
                    ? "text-white shadow-lg bg-gradient-to-r from-rose-700 to-amber-700"
                    : "bg-white text-rose-800 hover:bg-rose-50 shadow-sm border border-rose-100"
                }`}
              >
                All Subcategories
              </button>
              {filteredSubcategories.map((s) => (
                <button
                  key={s._id}
                  onClick={() => {
                    setSelectedSubcategory(s);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-[poppins] transition-all duration-300 ${
                    selectedSubcategory?._id === s._id
                      ? "text-white shadow-lg bg-gradient-to-r from-rose-700 to-amber-700"
                      : "bg-white text-rose-800 hover:bg-rose-50 shadow-sm border border-rose-100"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6 text-center font-[poppins] text-rose-900">
            {displayedProducts.length} product
            {displayedProducts.length !== 1 ? "s" : ""} found
            {selectedCategory ? ` in ${selectedCategory.name}` : ""}
            {selectedSubcategory ? ` / ${selectedSubcategory.name}` : ""}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-900"></div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && displayedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl max-w-md mx-auto p-8 shadow-lg border border-white/30">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-rose-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium font-[poppins] text-rose-900 mb-2">
                No products found
              </h3>
              <p className="font-[poppins] text-gray-600">
                {selectedCategory
                  ? `No products available in ${selectedCategory.name} category`
                  : "No products available at the moment"}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className="mt-4 px-4 py-2 bg-rose-100 text-rose-900 rounded-lg font-[poppins] text-sm hover:bg-rose-200 transition-colors"
              >
                View All Products
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {currentProducts.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 bg-white/90 backdrop-blur-sm group"
                  >
                    <div className="h-60 overflow-hidden relative">
                      <img
                        src={p.images?.[0] || "/default-product.jpg"}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {p.stock === 0 && (
                        <div className="absolute top-3 right-3 bg-rose-700 text-white text-xs px-2 py-1 rounded-full font-[poppins]">
                          Out of Stock
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-[poppins] font-semibold mb-2 text-rose-900 line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 font-[poppins]">
                        {p.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold font-[poppins] text-rose-900">
                          ₹{p.price}
                        </span>
                        <span className="text-xs font-[poppins] text-gray-500">
                          {p.stock} in stock
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          to={`/products/${p._id}`}
                          className="flex-1 text-center font-[poppins] text-sm py-2.5 bg-white text-rose-900 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Details
                        </Link>
                        <button
                          onClick={() => addToCart(p._id)}
                          disabled={p.stock === 0}
                          className={`flex-1 font-[poppins] text-sm py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center ${
                            p.stock === 0
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-rose-900 to-amber-800 text-white hover:shadow-lg"
                          }`}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2 font-[poppins]">
                    <button
                      onClick={() =>
                        currentPage > 1 && paginate(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-full bg-white border border-rose-200 text-rose-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`w-10 h-10 rounded-full transition-all duration-300 ${
                            currentPage === number
                              ? "bg-gradient-to-r from-rose-900 to-amber-800 text-white"
                              : "bg-white text-rose-900 border border-rose-200 hover:bg-rose-50"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        currentPage < totalPages && paginate(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full bg-white border border-rose-200 text-rose-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&family=Poppins:wght@300;400;500;600&display=swap");
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
          background-size: 300% 300%;
          animation: gradientFlow 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Store;
