import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BillForm from "../components/Bill/BillForm";
import { createBill } from "../services/api";

const CreateBillPage = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSave = async (billData) => {
    try {
      setLoading(true);
      const created = await createBill(billData);

      setToast({
        type: "success",
        message: "Bill created successfully!",
      });

      if (created?._id) {
        navigate(`/bill/${created._id}/view`);
      }
    } catch (error) {
      console.error("Error creating bill:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong while creating the bill.";

      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {toast && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm ${
            toast.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-blue-600 font-medium">Saving bill...</div>
      )}

      <div className="space-y-4">
        <BillForm onSave={handleSave} />
      </div>
    </div>
  );
};

export default CreateBillPage;
