// UpdateProductSelector.jsx - CORRECT VERSION
import React, { useState } from "react";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { Card, Button, Tag } from "antd";

const UpdateProductSelector = ({
  products,
  onProductSelect, // DIRECT CALLBACK FUNCTION
}) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Calculate available stock
  const getAvailableStock = (product) => {
    if (!product) return 0;
    const totalStock = product.totalStock || product.stock || 0;
    const inUseStock = product.inUseStock || 0;
    return totalStock - inUseStock;
  };
  console.log(
    "🚨 File content check - Component name:",
    // Check which component is defined
    typeof UpdateServiceSelector !== "undefined"
      ? "UpdateServiceSelector"
      : typeof UpdateProductSelector !== "undefined"
      ? "UpdateProductSelector"
      : "No component found"
  );
  // Handle product select
  const handleProductClick = (product) => {
    if (!product || !product._id) return;

    const availableStock = getAvailableStock(product);

    if (availableStock <= 0) {
      console.log("❌ Product out of stock:", product.name);
      return;
    }

    const existingIndex = selectedProducts.findIndex(
      (p) => p.productId === product._id
    );

    if (existingIndex !== -1) {
      // Update quantity
      const newQuantities = { ...quantities };
      const currentQty = quantities[product._id] || 1;

      if (currentQty < availableStock) {
        newQuantities[product._id] = currentQty + 1;
        setQuantities(newQuantities);
      }
    } else {
      // Add new product
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          availableStock: availableStock,
        },
      ]);
      setQuantities({
        ...quantities,
        [product._id]: 1,
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId, change) => {
    const product = selectedProducts.find((p) => p.productId === productId);
    if (!product) return;

    const currentQty = quantities[productId] || 1;
    const newQty = currentQty + change;

    if (newQty < 1) {
      // Remove product if quantity becomes 0
      setSelectedProducts((prev) =>
        prev.filter((p) => p.productId !== productId)
      );
      const newQuantities = { ...quantities };
      delete newQuantities[productId];
      setQuantities(newQuantities);
    } else if (newQty <= product.availableStock) {
      // Update quantity
      setQuantities({
        ...quantities,
        [productId]: newQty,
      });
    }
  };

  // Handle add to walk-in
  const handleAddToWalkin = () => {
    if (selectedProducts.length === 0) {
      console.log("❌ No products selected");
      return;
    }

    selectedProducts.forEach((product) => {
      const quantity = quantities[product.productId] || 1;

      const productData = {
        productId: product.productId,
        quantity: quantity,
        price: product.price,
        total: product.price * quantity,
        name: product.name,
      };

      console.log("✅ Adding product:", productData);

      // Call parent callback
      if (onProductSelect) {
        onProductSelect(productData);
      }
    });

    // Reset selection
    setSelectedProducts([]);
    setQuantities({});
  };

  // Calculate total
  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => {
      const quantity = quantities[product.productId] || 1;
      return sum + product.price * quantity;
    }, 0);
  };

  // ✅ FIX: Check if products array exists
  if (!products || !Array.isArray(products)) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No products available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card size="small" title="Selected Products" className="mb-4">
          <div className="space-y-3">
            {selectedProducts.map((product) => {
              const quantity = quantities[product.productId] || 1;
              const total = product.price * quantity;

              return (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      ₹{product.price} × {quantity} = ₹{total}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="small"
                      icon={<Minus className="w-3 h-3" />}
                      onClick={() =>
                        handleQuantityChange(product.productId, -1)
                      }
                    />
                    <span className="w-10 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      size="small"
                      icon={<Plus className="w-3 h-3" />}
                      onClick={() => handleQuantityChange(product.productId, 1)}
                      disabled={quantity >= product.availableStock}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{calculateTotal()}
                </span>
              </div>

              <Button
                type="primary"
                block
                className="mt-3"
                onClick={handleAddToWalkin}
                icon={<ShoppingBag />}
              >
                Add {selectedProducts.length} Product(s) to Walk-in
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const availableStock = getAvailableStock(product);
          const isOutOfStock = availableStock <= 0;
          const isSelected = selectedProducts.some(
            (p) => p.productId === product._id
          );

          return (
            <Card
              key={product._id}
              hoverable={!isOutOfStock}
              className={`border transition-all ${
                isOutOfStock
                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                  : isSelected
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:shadow-md hover:border-blue-300"
              }`}
              onClick={() => !isOutOfStock && handleProductClick(product)}
            >
              {product.images?.[0] && (
                <div
                  className={`relative h-40 overflow-hidden rounded-t-lg ${
                    isOutOfStock ? "opacity-50" : ""
                  }`}
                >
                  <img
                    alt={product.name}
                    src={product.images[0]}
                    className="w-full h-full object-cover"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-red-600 px-3 py-1 rounded-full">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <Plus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}
              <div className="p-3">
                <h4 className="font-[poppins] font-semibold text-gray-800 mb-2 line-clamp-1">
                  {product.name}
                </h4>

                {/* Stock Information */}
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">Available:</span>
                        <span
                          className={`font-bold ${
                            isOutOfStock
                              ? "text-red-600"
                              : availableStock <= 5
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {availableStock}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Tag color="green">
                        {quantities[product._id] || 1} selected
                      </Tag>
                    )}
                  </div>

                  {product.inUseStock > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {product.inUseStock} in use internally
                    </div>
                  )}

                  {availableStock <= 5 && !isOutOfStock && (
                    <div className="text-xs text-amber-600 mt-1 font-medium">
                      ⚠️ Low stock!
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-green-600">
                    ₹{product.price}
                  </span>

                  {!isOutOfStock && (
                    <button
                      className={`px-3 py-1 text-sm rounded ${
                        isSelected
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    >
                      {isSelected ? "Added" : "Add to List"}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UpdateProductSelector;
