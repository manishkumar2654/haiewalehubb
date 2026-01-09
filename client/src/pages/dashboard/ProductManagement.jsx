import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ProductForm from "./ProductForm";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Loader,
  Package,
  Layers,
  Eye,
  Calculator,
} from "lucide-react";
import Table from "../../components/ui/Table";
import ProductCategoryManagement from "./ProductCategoryManagement";
import SubcategoryManagement from "./SubcategoryManagement";
import { Modal } from "antd";

const ProductManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isInUseModalOpen, setIsInUseModalOpen] = useState(false);
  const [selectedProductForInUse, setSelectedProductForInUse] = useState(null);
  const [inUseStock, setInUseStock] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        api.get("/product-categories"),
        api.get("/subcategories"),
      ]);
      setCategories(categoriesRes.data);
      setSubcategories(subcategoriesRes.data);
    } catch (err) {
      addToast("Failed to load categories or subcategories", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === "categories" || activeTab === "subcategories") {
      fetchCategories();
    }
  }, [activeTab]);

  const handleSubmit = async (productData) => {
    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct._id}`, productData);
        addToast("Product updated successfully", "success");
      } else {
        await api.post("/products", productData);
        addToast("Product created successfully", "success");
      }
      fetchProducts();
      setIsModalOpen(false);
      setCurrentProduct(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to save product",
        "error"
      );
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await api.delete(`/products/${productId}`);
      addToast("Product deleted successfully", "success");
      fetchProducts();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete product",
        "error"
      );
    }
  };

  const handleSetInUseStock = async () => {
    if (!selectedProductForInUse) return;

    const inUseStockNum = parseInt(inUseStock);
    if (isNaN(inUseStockNum) || inUseStockNum < 0) {
      addToast("Please enter a valid quantity", "error");
      return;
    }

    if (inUseStockNum > selectedProductForInUse.totalStock) {
      addToast(
        `Cannot set more than total stock (${selectedProductForInUse.totalStock})`,
        "error"
      );
      return;
    }

    try {
      await api.post(`/products/${selectedProductForInUse._id}/set-in-use`, {
        inUseStock: inUseStockNum,
      });
      addToast("In-use stock updated successfully", "success");
      fetchProducts();
      setIsInUseModalOpen(false);
      setSelectedProductForInUse(null);
      setInUseStock("");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update in-use stock",
        "error"
      );
    }
  };

  const openEditModal = (product = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.productCategory?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (product.subcategory?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: "Image",
      accessor: "images",
      cell: (value) => (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
          {value?.[0] ? (
            <img
              src={value[0]}
              alt="Product"
              className="w-full h-full object-contain rounded"
              onError={(e) => {
                e.target.src = "/default-product.jpg";
              }}
            />
          ) : (
            <div className="bg-gray-200 w-full h-full rounded flex items-center justify-center text-gray-500">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Name",
      accessor: "name",
      cell: (value) => <span className="font-medium text-black">{value}</span>,
    },
    {
      header: "Category",
      accessor: "productCategory",
      cell: (value) => <span className="text-black">{value?.name || "-"}</span>,
    },
    {
      header: "Price",
      accessor: "price",
      cell: (value) => (
        <span className="font-bold text-black">₹{value.toFixed(2)}</span>
      ),
    },
    {
      header: "Stock Status",
      accessor: "totalStock",
      cell: (totalStock, row) => {
        const inUseStock = row.inUseStock || 0;
        const availableStock = totalStock - inUseStock;

        return (
          <div className="flex flex-col">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded border border-gray-300">
                <div className="font-bold text-black">{totalStock}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                <div className="font-bold text-black">{inUseStock}</div>
                <div className="text-xs text-gray-600">In Use</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                <div className="font-bold text-black">{availableStock}</div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
            </div>
            <div className="text-xs text-gray-700 mt-1 text-center">
              Available = Total ({totalStock}) - In Use ({inUseStock})
            </div>
            {availableStock < 5 && availableStock > 0 && (
              <div className="text-xs text-amber-700 mt-1 text-center font-medium">
                ⚠️ Only {availableStock} left!
              </div>
            )}
            {availableStock === 0 && (
              <div className="text-xs text-red-700 mt-1 text-center font-medium">
                ⛔ Out of stock
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "_id",
      cell: (id, row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/products/${id}`)}
            title="View Details"
            className="hover:bg-gray-100 border-gray-300 text-black"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
            title="Edit Product"
            className="hover:bg-gray-100 border-gray-300 text-black"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedProductForInUse(row);
              setInUseStock(row.inUseStock || "");
              setIsInUseModalOpen(true);
            }}
            title="Set In-Use Stock"
            className="border-gray-300 hover:bg-gray-100 text-black"
          >
            <Calculator className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(id)}
            className="text-black border-red-300 hover:bg-red-50"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Product Categories", icon: Layers },
    { id: "subcategories", label: "Subcategories", icon: Layers },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="flex mb-6 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 -mb-px border-b-2 ${
              activeTab === id
                ? "border-blue-600 text-black font-medium"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            <span className="text-black">{label}</span>
          </button>
        ))}
      </nav>

      {activeTab === "products" && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-black">
              Product Management
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                onClick={() => openEditModal()}
                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {loading ? (
            <Card className="flex items-center justify-center p-8">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </Card>
          ) : error ? (
            <Card className="p-4 text-red-700 bg-red-50">{error}</Card>
          ) : (
            <Card className="overflow-hidden border border-gray-200">
              <Table
                columns={columns}
                data={filteredProducts}
                emptyMessage={
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-black">
                      No products found
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {searchTerm
                        ? "Try a different search term"
                        : "Get started by adding a new product"}
                    </p>
                    {!searchTerm && (
                      <div className="mt-6">
                        <Button
                          onClick={() => openEditModal()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    )}
                  </div>
                }
              />
            </Card>
          )}

          {/* Ant Design Modal for Product Edit/Create */}
          <Modal
            title={
              <span className="text-black font-bold text-lg">
                {currentProduct ? "Edit Product" : "Add New Product"}
              </span>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setCurrentProduct(null);
            }}
            footer={null}
            width={1000}
            centered
            className="product-modal"
          >
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <ProductForm
                product={currentProduct}
                categories={categories}
                subcategories={subcategories}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setCurrentProduct(null);
                }}
              />
            </div>
          </Modal>

          {/* In-Use Stock Modal */}
          <Modal
            title={
              <span className="text-black font-bold">Set In-Use Stock</span>
            }
            open={isInUseModalOpen}
            onCancel={() => {
              setIsInUseModalOpen(false);
              setSelectedProductForInUse(null);
            }}
            footer={null}
            width={500}
            centered
          >
            {selectedProductForInUse && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-black">
                    {selectedProductForInUse.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xl font-bold text-black">
                        {selectedProductForInUse.totalStock}
                      </div>
                      <div className="text-xs text-gray-600">Total Stock</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xl font-bold text-black">
                        {selectedProductForInUse.inUseStock || 0}
                      </div>
                      <div className="text-xs text-gray-600">
                        Current In Use
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xl font-bold text-black">
                        {selectedProductForInUse.totalStock -
                          (selectedProductForInUse.inUseStock || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Available</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    <span className="font-medium text-black">Formula: </span>
                    <span className="text-black">
                      Available = Total - In Use
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-black">
                    Set In-Use Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedProductForInUse.totalStock}
                    value={inUseStock}
                    onChange={(e) => setInUseStock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder={`Enter quantity...`}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsInUseModalOpen(false);
                      setSelectedProductForInUse(null);
                    }}
                    className="text-black border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSetInUseStock}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update In-Use Stock
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {activeTab === "categories" && (
        <ProductCategoryManagement refreshCategories={fetchCategories} />
      )}

      {activeTab === "subcategories" && (
        <SubcategoryManagement
          categories={categories}
          subcategories={subcategories}
          refreshData={fetchCategories}
        />
      )}

      {/* Global Styles for Black Text */}
      <style jsx global>{`
        .product-modal .ant-modal-content {
          border-radius: 12px;
          padding: 0;
        }

        .product-modal .ant-modal-header {
          border-bottom: 1px solid #e5e7eb;
          padding: 20px 24px;
          margin: 0;
          border-radius: 12px 12px 0 0;
          background: white;
        }

        .product-modal .ant-modal-body {
          padding: 24px;
          color: black;
        }

        .product-modal .ant-modal-title {
          color: black !important;
        }

        .ant-modal-close {
          color: #6b7280 !important;
        }

        .ant-modal-close:hover {
          color: #374151 !important;
        }

        /* Ensure all text in modal is black */
        .product-modal,
        .product-modal * {
          color: black !important;
        }

        /* Input fields styling */
        .product-modal input,
        .product-modal select,
        .product-modal textarea {
          color: black !important;
        }

        /* Placeholder color */
        .product-modal ::placeholder {
          color: #6b7280 !important;
        }

        /* Scrollbar styling */
        .product-modal ::-webkit-scrollbar {
          width: 8px;
        }

        .product-modal ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .product-modal ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .product-modal ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default ProductManagement;
