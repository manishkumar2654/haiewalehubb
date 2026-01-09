import { useState } from "react";
import CustomerSection from "./CustomerSection";
import ServicesSection from "./ServicesSection";
import ProductsSection from "./ProductsSection";
import InvoiceSummary from "./InvoiceSummary";

const BillForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    customerId: "",
    gender: "Male",
    date: new Date().toISOString().split("T")[0],
    roomNo: "",
    services: [
      {
        serviceName: "",
        duration: "60 Min",
        staffAssigned: "",
        price: 0,
        gst: 5,
        discount: 5,
        total: 0,
      },
    ],
    products: [
      {
        productName: "",
        quantity: 1,
        unitPrice: 0,
        gst: 5,
        discount: 5,
        total: 0,
      },
    ],
    discountPercent: 5,
    paymentMethod: "Cash",
    acharosAmount: 0,
  });

  const [errors, setErrors] = useState({});

  const handleCustomerChange = (customerData) => {
    setFormData({ ...formData, ...customerData });
  };

  const handleServiceChange = (services) => {
    setFormData({ ...formData, services });
  };

  const handleProductChange = (products) => {
    setFormData({ ...formData, products });
  };

  const handleInvoiceChange = (invoiceData) => {
    setFormData({ ...formData, ...invoiceData });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.customerId) newErrors.customerId = "Customer ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className=" border-pink-600 pb-6">
        <CustomerSection
          data={{
            name: formData.name,
            phone: formData.phone,
            customerId: formData.customerId,
            gender: formData.gender,
            date: formData.date,
            roomNo: formData.roomNo,
          }}
          onChange={handleCustomerChange}
          errors={errors}
        />
      </div>

      <div className="border-b border-pink-600  pb-6">
        <h2 className="w-96 justify-start text-pink-600 text-2xl font-bold font-['Philosopher'] leading-7 mb-7">
          Services Provided
        </h2>
        <ServicesSection
          services={formData.services}
          onChange={handleServiceChange}
        />
      </div>

      <div className="border-b border-pink-600 pb-6">
        <h2 className="w-96 justify-start text-pink-600 text-2xl font-bold font-['Philosopher'] leading-7 mb-7">
          Products Sold
        </h2>
        <ProductsSection
          products={formData.products}
          onChange={handleProductChange}
        />
      </div>

      <div className="pt-6">
        <InvoiceSummary
          data={{
            discountPercent: formData.discountPercent,
            paymentMethod: formData.paymentMethod,
            acharosAmount: formData.acharosAmount,
            services: formData.services,
            products: formData.products,
          }}
          onChange={handleInvoiceChange}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="flex items-center text-sm bg-pink-600 font-medium font-['Inter'] text-white px-3 py-1 rounded hover:bg-pink-700"
        >
          Generate Bill
        </button>
      </div>
    </form>
  );
};

export default BillForm;
