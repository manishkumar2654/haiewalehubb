// InlineProductSelector.jsx - Product selection modal for walk-in table
import React, { useState, useEffect } from "react";
import { Modal, Card, Table, Button, Input, Tag, message, InputNumber } from "antd";
import { Search, ShoppingBag, X } from "lucide-react";

const InlineProductSelector = ({
  visible,
  onClose,
  walkin,
  products,
  onProductsSelected,
}) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize with existing products
  useEffect(() => {
    if (visible && walkin) {
      const existingProducts = (walkin.products || []).map((p) => ({
        productId: p.product?._id || p.product,
        name: p.product?.name || "Product",
        price: p.price || 0,
        quantity: p.quantity || 1,
        total: p.total || p.price * (p.quantity || 1),
      }));
      setSelectedProducts(existingProducts);
    }
  }, [visible, walkin]);

  const getAvailableStock = (product) => {
    const totalStock = product.totalStock || product.stock || 0;
    const inUseStock = product.inUseStock || 0;
    return totalStock - inUseStock;
  };

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    const availableStock = getAvailableStock(product);
    if (availableStock <= 0) {
      message.warning(`${product.name} is out of stock`);
      return;
    }

    const existingProduct = selectedProducts.find(
      (p) => p.productId === productId
    );

    if (existingProduct) {
      if (existingProduct.quantity >= availableStock) {
        message.warning(`Only ${availableStock} units available`);
        return;
      }
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.productId === productId
            ? {
                ...p,
                quantity: p.quantity + 1,
                total: (p.quantity + 1) * p.price,
              }
            : p
        )
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId,
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price,
          availableStock,
        },
      ]);
      message.success(`Added ${product.name}`);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    const availableStock = getAvailableStock(product);
    if (quantity > availableStock) {
      message.warning(`Only ${availableStock} units available`);
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? {
              ...p,
              quantity,
              total: quantity * p.price,
            }
          : p
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productId !== productId)
    );
    message.info("Product removed");
  };

  const handleSave = () => {
    if (selectedProducts.length === 0) {
      message.warning("Please select at least one product");
      return;
    }
    onProductsSelected(selectedProducts);
    onClose();
  };

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (_, record) => {
        const product = products.find((p) => p._id === record.productId);
        const availableStock = getAvailableStock(product);
        return (
          <InputNumber
            min={1}
            max={availableStock}
            value={record.quantity}
            onChange={(value) =>
              handleQuantityChange(record.productId, value || 1)
            }
            style={{ width: 80 }}
          />
        );
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `₹${total || 0}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<X className="w-3 h-3" />}
          onClick={() => handleRemoveProduct(record.productId)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`Select Products - ${walkin?.walkinNumber || ""}`}
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save Products ({selectedProducts.length})
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Search products..."
          prefix={<Search className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
          {filteredProducts.map((product) => {
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
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                    : isSelected
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:shadow-md"
                }`}
                onClick={() => !isOutOfStock && handleProductSelect(product._id)}
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {product.name}
                    </h4>
                    <div className="text-sm text-gray-600 mb-2">
                      Available: {availableStock}
                    </div>
                    <div className="font-bold text-green-600">
                      ₹{product.price}
                    </div>
                  </div>
                  {isSelected && (
                    <Tag color="blue">Selected</Tag>
                  )}
                  {!isOutOfStock && (
                    <ShoppingBag className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Products Table */}
        {selectedProducts.length > 0 && (
          <Card size="small" title={`Selected Products (${selectedProducts.length})`}>
            <Table
              dataSource={selectedProducts}
              columns={columns}
              pagination={false}
              size="small"
              rowKey="productId"
            />
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Products Price:</span>
                <span className="text-green-600">
                  ₹
                  {selectedProducts
                    .reduce((sum, p) => sum + (p.total || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default InlineProductSelector;
