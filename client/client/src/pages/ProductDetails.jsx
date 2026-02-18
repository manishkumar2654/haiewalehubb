import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Minus,
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Package,
  PackageCheck,
  PackageX,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setMainImage(res.data.images?.[0] || "/default-product.jpg");

        // Set initial quantity based on available stock
        const availableStock = res.data.totalStock - (res.data.inUseStock || 0);
        if (availableStock > 0) {
          setQuantity(Math.min(1, availableStock));
        }
      } catch {
        addToast("Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, addToast]);

  const addToCart = async () => {
    if (!user) {
      addToast("Please login to add items to cart", "error");
      navigate("/auth/login", { state: { from: `/products/${id}` } });
      return;
    }

    const availableStock = product.totalStock - (product.inUseStock || 0);
    if (quantity > availableStock) {
      addToast(`Only ${availableStock} items available`, "error");
      return;
    }

    try {
      await api.post("/cart", { product: id, quantity });
      addToast(
        `Added ${quantity} item${quantity > 1 ? "s" : ""} to cart`,
        "success"
      );
    } catch {
      addToast("Failed to add to cart", "error");
    }
  };

  const toggleWishlist = () => {
    if (!user) {
      addToast("Please login to add to wishlist", "error");
      navigate("/auth/login", { state: { from: `/products/${id}` } });
      return;
    }
    setIsWishlisted(!isWishlisted);
    addToast(
      isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      "success"
    );
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("Link copied to clipboard", "success");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/30 max-w-md">
          <h2 className="text-2xl font-[philosopher] text-rose-900 mb-4">
            Product Not Found
          </h2>
          <p className="font-[poppins] text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-rose-900 to-amber-800 text-white rounded-lg font-[poppins] hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="inline w-5 h-5 mr-2" /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate available stock
  const totalStock = product.totalStock || 0;
  const inUseStock = product.inUseStock || 0;
  const availableStock = totalStock - inUseStock;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-rose-200/20 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-amber-200/20 blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center font-[poppins] text-rose-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
          {/* Image Gallery */}
          <div className="p-6">
            <div className="relative h-96 rounded-xl overflow-hidden mb-4 bg-gray-50">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500"
                onError={(e) => {
                  e.target.src = "/default-product.jpg";
                }}
              />
              {availableStock === 0 && (
                <div className="absolute top-4 left-4 bg-rose-700 text-white text-sm px-3 py-1 rounded-full font-[poppins]">
                  Out of Stock
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      mainImage === img
                        ? "border-rose-600 scale-105"
                        : "border-transparent hover:border-rose-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-product.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 lg:p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-[philosopher] text-rose-900">
                {product.name}
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full transition-colors ${
                    isWishlisted
                      ? "bg-rose-100 text-rose-600"
                      : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold font-[poppins] text-rose-900">
                ₹{product.price.toFixed(2)}
              </span>
            </div>

            {/* Stock Information Section */}
            <div className="mb-6 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-4 border border-rose-100">
              <h2 className="text-lg font-semibold font-[poppins] text-rose-900 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Stock Information
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Total Stock */}
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center">
                    <Package className="h-8 w-8 text-gray-600 mb-1" />
                    <div className="text-2xl font-bold text-gray-800">
                      {totalStock}
                    </div>
                    <div className="text-sm text-gray-600">Total Stock</div>
                  </div>
                </div>

                {/* In Use Stock */}
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center">
                    <PackageX className="h-8 w-8 text-blue-600 mb-1" />
                    <div className="text-2xl font-bold text-blue-600">
                      {inUseStock}
                    </div>
                    <div className="text-sm text-gray-600">In Use</div>
                  </div>
                </div>

                {/* Available Stock */}
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center">
                    <PackageCheck className="h-8 w-8 text-green-600 mb-1" />
                    <div className="text-2xl font-bold text-green-600">
                      {availableStock}
                    </div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </div>
              </div>

              {/* Stock Formula */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-700 text-center font-[poppins]">
                  <span className="font-medium">Formula: </span>
                  <span className="text-gray-800">Total Stock</span>
                  <span className="mx-2">-</span>
                  <span className="text-blue-600">In Use</span>
                  <span className="mx-2">=</span>
                  <span className="text-green-600 font-bold">Available</span>
                  <div className="mt-1 text-xs text-gray-500">
                    ({totalStock} - {inUseStock} = {availableStock})
                  </div>
                </div>
              </div>

              {/* Stock Status Message */}
              {availableStock === 0 ? (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <div className="flex items-center text-rose-700">
                    <PackageX className="h-5 w-5 mr-2" />
                    <span className="font-medium">Currently unavailable</span>
                  </div>
                  <p className="text-sm text-rose-600 mt-1 ml-7">
                    All {totalStock} items are currently in use internally.
                  </p>
                </div>
              ) : availableStock < 5 ? (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center text-amber-700">
                    <Package className="h-5 w-5 mr-2" />
                    <span className="font-medium">Low stock available</span>
                  </div>
                  <p className="text-sm text-amber-600 mt-1 ml-7">
                    Only {availableStock} items available for purchase.
                  </p>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <PackageCheck className="h-5 w-5 mr-2" />
                    <span className="font-medium">In stock</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1 ml-7">
                    {availableStock} items available for purchase.
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold font-[poppins] text-rose-900 mb-2">
                Description
              </h2>
              <p className="font-[poppins] text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-6 py-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-[poppins] text-gray-700 mr-4">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden inline-flex">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 bg-rose-50 text-rose-900 hover:bg-rose-100 transition-colors"
                      disabled={quantity <= 1 || availableStock === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-black font-[poppins] font-medium min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(availableStock, quantity + 1))
                      }
                      className="px-3 py-2 bg-rose-50 text-rose-900 hover:bg-rose-100 transition-colors"
                      disabled={
                        quantity >= availableStock || availableStock === 0
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-[poppins] text-gray-500">
                    Available for purchase:
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {availableStock} items
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={addToCart}
                  disabled={availableStock === 0}
                  className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-[poppins] font-medium transition-all duration-300 ${
                    availableStock === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-rose-900 to-amber-800 text-white hover:shadow-lg"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {availableStock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  className={`py-3 px-6 rounded-lg font-[poppins] font-medium transition-all duration-300 ${
                    availableStock === 0
                      ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                      : "border border-rose-900 text-rose-900 hover:bg-rose-900 hover:text-white"
                  }`}
                  disabled={availableStock === 0}
                >
                  Buy Now
                </button>
              </div>

              {availableStock === 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-sm text-rose-700 text-center">
                    This product has {totalStock} items in total, but all are
                    currently in use internally. Please check back later.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold font-[poppins] text-rose-900 mb-2">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4 font-[poppins]">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-rose-900">
                    {product.productCategory?.name || "N/A"}
                  </p>
                </div>
                {product.subcategory?.name && (
                  <div>
                    <p className="text-sm text-gray-600">Subcategory</p>
                    <p className="text-rose-900">{product.subcategory.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-rose-900 font-medium">
                    {totalStock} units
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Currently Available</p>
                  <p
                    className={`font-medium ${
                      availableStock > 0 ? "text-green-600" : "text-rose-600"
                    }`}
                  >
                    {availableStock} units
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&family=Poppins:wght@300;400;500;600&display=swap");
      `}</style>
    </div>
  );
};

export default ProductDetails;
