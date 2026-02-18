import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BillForm from "../components/Bill/BillForm";
import { getBillById, updateBill } from "../services/api";

const EditBillPage = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const data = await getBillById(id);
        setBill(data);
      } catch (error) {
        console.error("Error fetching bill:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id]);

  const handleSave = async (updatedBill) => {
    try {
      await updateBill(id, updatedBill);
      // Redirect or show success message
    } catch (error) {
      console.error("Error updating bill:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {bill && (
        <BillForm
          editBill={bill}
          onSave={handleSave}
          onClose={() => window.history.back()}
        />
      )}
    </div>
  );
};

export default EditBillPage;
