import { useState, useEffect } from "react";
import { Download, Search, Eye, Filter } from "lucide-react";
import { formatDate, formatCurrency } from "../utils/formatters";
import { getBills } from "../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const ViewBillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await getBills();
        setBills(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 6);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const stripTime = (dateStr) => {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const filteredByDate = bills.filter((bill) => {
    if (!startDate || !endDate) return true;
    const billDate = stripTime(bill.date);
    return billDate >= stripTime(startDate) && billDate <= stripTime(endDate);
  });
  const dailyIncome = filteredByDate
    .filter(
      (bill) => stripTime(bill.date).getTime() === stripTime(today).getTime()
    )
    .reduce((sum, bill) => sum + (bill.totalPrice || 0), 0);

  const weeklyIncome = filteredByDate
    .filter((bill) => {
      const billDate = stripTime(bill.date);
      return billDate >= oneWeekAgo && billDate <= today;
    })
    .reduce((sum, bill) => sum + (bill.totalPrice || 0), 0);
  const monthlyIncome = filteredByDate
    .filter((bill) => {
      const billDate = stripTime(bill.date);
      return billDate >= oneMonthAgo && billDate <= today;
    })
    .reduce((sum, bill) => sum + (bill.totalPrice || 0), 0);

  const rangeIncome = filteredByDate.reduce(
    (sum, bill) => sum + (bill.totalPrice || 0),
    0
  );

  const filteredBills = filteredByDate.filter(
    (bill) =>
      bill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerId?.includes(searchTerm)
  );

  const handleDownload = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bills/${id}/download`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download PDF.");
    }
  };

  const closeModal = () => setSelectedBill(null);

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      {/* Income Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <p className="text-sm text-green-800 font-semibold">Today’s Income</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {formatCurrency(dailyIncome)}
          </p>
        </div>
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold">
            Last 7 Days Income
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {formatCurrency(weeklyIncome)}
          </p>
        </div>
        <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
          <p className="text-sm text-purple-800 font-semibold">
            Last 30 Days Income
          </p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {formatCurrency(monthlyIncome)}
          </p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-semibold">
            {startDate && endDate ? (
              <>
                {formatDate(startDate)} to {formatDate(endDate)}
              </>
            ) : (
              "All Time Income"
            )}
          </p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {formatCurrency(rangeIncome)}
          </p>
        </div>
      </div>

      {/* Search and Date Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search bills by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" size={20} />
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              placeholderText="Select date range"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {dateRange[0] && (
              <button
                onClick={() => setDateRange([null, null])}
                className="px-3 py-2 bg-gray-200 rounded-lg text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBills.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500 text-sm"
                >
                  No bills found.
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {bill.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {bill.name}
                    </div>
                    <div className="text-sm text-gray-500">{bill.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(bill.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(bill.totalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.paymentMethod === "Cash"
                          ? "bg-green-100 text-green-800"
                          : bill.paymentMethod === "UPI"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownload(bill._id)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4 text-pink-600">
              Bill Details — {selectedBill.invoiceNumber}
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {selectedBill.name}
              </p>
              <p>
                <strong>Phone:</strong> {selectedBill.phone}
              </p>
              <p>
                <strong>Gender:</strong> {selectedBill.gender}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedBill.date)}
              </p>
              <p>
                <strong>Customer ID:</strong> {selectedBill.customerId}
              </p>
              <p>
                <strong>Discount:</strong> {selectedBill.discountPercent}%
              </p>
              <p>
                <strong>Total:</strong>{" "}
                {formatCurrency(selectedBill.totalPrice)}
              </p>
              <p>
                <strong>Payment:</strong> {selectedBill.paymentMethod}
              </p>

              <hr />

              <div>
                <h4 className="font-semibold mt-2">Services</h4>
                {selectedBill.services?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {selectedBill.services.map((s, idx) => (
                      <li key={idx}>
                        {s.serviceName} — {formatCurrency(s.price)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No services</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mt-2">Products</h4>
                {selectedBill.products?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {selectedBill.products.map((p, idx) => (
                      <li key={idx}>
                        {p.productName} × {p.quantity} —{" "}
                        {formatCurrency(p.unitPrice)} each
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No products</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBillsPage;
