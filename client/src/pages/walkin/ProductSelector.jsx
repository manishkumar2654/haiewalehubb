import React from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Input, Table, Card } from "antd";

const ProductSelector = ({ formData, setFormData, products }) => {
  // Calculate available stock for each product
  const getAvailableStock = (product) => {
    const totalStock = product.totalStock || product.stock || 0;
    const inUseStock = product.inUseStock || 0;
    return totalStock - inUseStock;
  };

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p._id === productId);
    const availableStock = getAvailableStock(product);

    // Check if product has available stock
    if (availableStock <= 0) {
      return; // Don't allow selection if no stock available
    }

    const existingProduct = formData.selectedProducts.find(
      (p) => p.productId === productId
    );

    if (existingProduct) {
      // Check if we can add more quantity
      if (existingProduct.quantity >= availableStock) {
        return; // Don't exceed available stock
      }

      setFormData((prev) => ({
        ...prev,
        selectedProducts: prev.selectedProducts.map((p) =>
          p.productId === productId
            ? {
                ...p,
                quantity: p.quantity + 1,
                total: (p.quantity + 1) * p.price,
              }
            : p
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedProducts: [
          ...prev.selectedProducts,
          {
            productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            total: product.price,
            image: product.images[0],
            availableStock: availableStock, // Store available stock for validation
          },
        ],
      }));
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const product = products.find((p) => p._id === productId);
    const availableStock = getAvailableStock(product);

    // Don't allow quantity more than available stock
    if (quantity > availableStock) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product) =>
        product.productId === productId
          ? {
              ...product,
              quantity,
              total: quantity * product.price,
            }
          : product
      ),
    }));
  };

  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(
        (product) => product.productId !== productId
      ),
    }));
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      width: "25%",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price}`,
      width: "15%",
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (_, record) => {
        const product = products.find((p) => p._id === record.productId);
        const availableStock = getAvailableStock(product);

        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min={1}
              max={availableStock}
              value={record.quantity}
              onChange={(e) =>
                handleQuantityChange(
                  record.productId,
                  parseInt(e.target.value) || 1
                )
              }
              style={{ width: 80 }}
            />
            <span className="text-xs text-gray-500">
              / {availableStock} available
            </span>
          </div>
        );
      },
      width: "25%",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `₹${total}`,
      width: "15%",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex justify-center">
          <Trash2
            className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
            onClick={() => handleRemoveProduct(record.productId)}
          />
        </div>
      ),
      width: "10%",
    },
  ];

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <ShoppingBag className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No products available
        </h3>
        <p className="text-gray-500">Check back later for products</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const availableStock = getAvailableStock(product);
          const isOutOfStock = availableStock <= 0;
          const isLowStock = availableStock > 0 && availableStock <= 5;

          return (
            <Card
              key={product._id}
              hoverable={!isOutOfStock}
              className={`border transition-all ${
                isOutOfStock
                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                  : "border-gray-200 hover:shadow-md hover:border-blue-300"
              }`}
              onClick={() => !isOutOfStock && handleProductSelect(product._id)}
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
                              : isLowStock
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {availableStock}
                        </span>
                      </div>
                    </div>
                  </div>

                  {product.inUseStock > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {product.inUseStock} in use internally
                    </div>
                  )}

                  {isLowStock && !isOutOfStock && (
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
                        isLowStock
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductSelect(product._id);
                      }}
                    >
                      Add to List
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Products */}
      {formData.selectedProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-[poppins] font-semibold mb-4 text-black">
            Selected Products ({formData.selectedProducts.length})
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <Table
              dataSource={formData.selectedProducts}
              columns={columns}
              pagination={false}
              size="small"
              rowKey="productId"
              className="custom-table"
            />

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <div className="text-black">
                  <div className="font-semibold mb-1">Stock Validation:</div>
                  <div className="text-sm text-gray-700">
                    {formData.selectedProducts.map((item, index) => {
                      const product = products.find(
                        (p) => p._id === item.productId
                      );
                      const availableStock = getAvailableStock(product);
                      const isOverLimit = item.quantity > availableStock;

                      return isOverLimit ? (
                        <div key={index} className="text-red-600 text-xs mb-1">
                          ⚠️ {item.name}: Cannot select {item.quantity}, only{" "}
                          {availableStock} available
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-black">
                    Total: ₹
                    {formData.selectedProducts.reduce(
                      (sum, item) => sum + item.total,
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formData.selectedProducts.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}{" "}
                    items
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        .custom-table .ant-table {
          color: black;
        }

        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb;
          color: black !important;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }

        .custom-table .ant-table-tbody > tr > td {
          color: black;
          border-bottom: 1px solid #f0f0f0;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc;
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default ProductSelector;
