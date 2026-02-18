const InvoiceSummary = ({ data, onChange }) => {
  const calculateSubTotal = () => {
    const serviceTotal = data.services.reduce(
      (sum, service) => sum + service.total,
      0
    );
    const productTotal = data.products.reduce(
      (sum, product) => sum + product.total,
      0
    );
    return serviceTotal + productTotal;
  };

  const calculateTotal = () => {
    const subTotal = calculateSubTotal();
    return (
      subTotal * (1 - data.discountPercent / 100) + (data.aadvanceAmount || 0)
    );
  };

  return (
    <div className="space-y-4 text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="w-32 justify-start text-stone-900 text-sm font-normal font-['Poppins']">
              Discount %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.discountPercent}
              onChange={(e) =>
                onChange({
                  ...data,
                  discountPercent: parseFloat(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="w-32 justify-start text-stone-900 text-sm font-normal font-['Poppins']">
              Payment Method
            </label>
            <div className="flex space-x-4">
              {["Cash", "UPI", "Card"].map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="radio"
                    checked={data.paymentMethod === method}
                    onChange={() =>
                      onChange({ ...data, paymentMethod: method })
                    }
                    className="mr-2"
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="w-32 justify-start text-stone-900 text-sm font-normal font-['Poppins']">
              Advance Amount
            </label>
            <input
              type="number"
              min="0"
              value={data.advanceAmount}
              onChange={(e) =>
                onChange({ ...data, advanceAmount: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="w-32 justify-start text-stone-900 text-lg font-bold font-['Poppins']">
            Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="w-32 justify-start text-stone-900 text-sm font-normal font-['Poppins']">
                Sub Total:
              </span>
              <span>₹{calculateSubTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="w-32 justify-start text-stone-900 text-sm font-normal font-['Poppins']">
                Discount ({data.discountPercent}%):
              </span>
              <span>
                -₹
                {((calculateSubTotal() * data.discountPercent) / 100).toFixed(
                  2
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="w-32 justify-start text-stone-900 text-sm font-normal font-['Poppins']">
                Advance Amount:
              </span>
              <span>₹{(data.advanceAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Price:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
