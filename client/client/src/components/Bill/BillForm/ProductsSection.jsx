import { Plus, Trash2 } from "lucide-react";

const ProductsSection = ({ products, onChange }) => {
  const addProduct = () => {
    onChange([
      ...products,
      {
        productName: "",
        quantity: 1,
        unitPrice: 0,
        gst: 5,
        discount: 5,
        total: 0,
      },
    ]);
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;

    if (["quantity", "unitPrice", "gst", "discount"].includes(field)) {
      updated[index].total = calculateProductTotal(updated[index]);
    }

    onChange(updated);
  };

  const calculateProductTotal = (product) => {
    return (
      product.quantity *
      product.unitPrice *
      (1 + product.gst / 100) *
      (1 - product.discount / 100)
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                Product Name
              </th>
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                Quantity
              </th>
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                Unit Price
              </th>
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                GST
              </th>
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                Discount
              </th>
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                Total
              </th>
              <th className="justify-start text-stone-900 text-base font-bold  font-['Philosopher'] leading-normal">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-red-200">
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="text"
                    value={product.productName}
                    onChange={(e) =>
                      updateProduct(index, "productName", e.target.value)
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    placeholder="Face Wash"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) =>
                      updateProduct(index, "quantity", parseInt(e.target.value))
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.unitPrice}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "unitPrice",
                        parseFloat(e.target.value)
                      )
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={product.gst}
                    onChange={(e) =>
                      updateProduct(index, "gst", parseFloat(e.target.value))
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center ">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={product.discount}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "discount",
                        parseFloat(e.target.value)
                      )
                    }
                    className="justify-start text-stone-900 text-sm font-medium font-['Inter'] leading-tight"
                    required
                  />
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white text-stone-900 justify-start items-center ">
                  ₹{product.total.toFixed(2)}
                </td>
                <td className="self-stretch pl-2.5 pr-6 py-4 bg-white  justify-start items-center  text-center">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(products.filter((_, i) => i !== index))
                    }
                    className="text-red-500 hover:text-red-700"
                    disabled={products.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addProduct}
        className="flex items-center text-sm bg-pink-600 font-medium font-['Inter'] text-white px-3 py-1 rounded hover:bg-pink-700"
      >
        <Plus size={16} className="mr-1" />
        Add Product
      </button>
    </div>
  );
};

export default ProductsSection;
