import React from "react";
import { useState } from "react";
import { Download, Save, X } from "lucide-react";
import { Modal, Tag, Button, QRCode } from "antd";
import api from "../../services/api";
import { message } from "antd";

const WalkinDetailsModal = ({ walkinData, setWalkinData, fetchWalkins }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async (walkinId) => {
    try {
      const res = await api.get(`/walkins/${walkinId}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `walkin-${walkinId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("PDF downloaded successfully!");
    } catch (error) {
      message.error("Failed to download PDF");
    }
  };

  const handleUpdateWalkin = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/walkins/${walkinData._id}`, walkinData);
      message.success("Walkin updated successfully!");
      setIsEditing(false);
      fetchWalkins();
    } catch (error) {
      message.error("Failed to update walkin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Walk-in Details"
      visible={!!walkinData}
      onCancel={() => setWalkinData(null)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setWalkinData(null)}>
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<Download className="w-4 h-4" />}
          onClick={() => handleDownloadPDF(walkinData._id)}
        >
          Download PDF
        </Button>,
        isEditing && (
          <Button
            key="save"
            type="primary"
            icon={<Save className="w-4 h-4" />}
            loading={loading}
            onClick={handleUpdateWalkin}
          >
            Save Changes
          </Button>
        ),
      ]}
    >
      {walkinData && (
        <div className="space-y-6">
          {/* QR Code Section */}
          <div className="flex items-center justify-center mb-6">
            <QRCode
              value={JSON.stringify({
                walkinId: walkinData._id,
                walkinNumber: walkinData.walkinNumber,
                downloadUrl: `${window.location.origin}/api/v1/walkins/${walkinData._id}/pdf`,
              })}
              size={200}
            />
          </div>

          {/* Walkin Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Walk-in #</label>
              <p className="font-semibold">{walkinData.walkinNumber}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Invoice #</label>
              <p className="font-semibold">{walkinData.invoiceNumber}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Customer</label>
              <p className="font-semibold">{walkinData.customerName}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Phone</label>
              <p className="font-semibold">{walkinData.customerPhone}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Branch</label>
              <p className="font-semibold">{walkinData.branch}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Status</label>
              <Tag
                color={
                  walkinData.status === "completed"
                    ? "green"
                    : walkinData.status === "cancelled"
                    ? "red"
                    : "blue"
                }
              >
                {walkinData.status.toUpperCase()}
              </Tag>
            </div>
          </div>

          {/* Services & Products */}
          <div>
            <h4 className="font-[poppins] font-semibold mb-3">Services</h4>
            {walkinData.services?.map((service, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded mb-2"
              >
                <div>
                  <div className="font-medium">
                    {service.service?.name || "Unknown Service"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {service.category?.name || "Uncategorized"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ₹{service.price?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {service.duration || 0} mins
                  </div>
                </div>
              </div>
            ))}

            <h4 className="font-[poppins] font-semibold mt-6 mb-3">Products</h4>
            {walkinData.products?.map((product, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded mb-2"
              >
                <div>
                  <div className="font-medium">
                    {product.product?.name || "Unknown Product"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Qty: {product.quantity || 1}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ₹{product.total?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-sm text-gray-600">
                    ₹{product.price?.toFixed(2) || "0.00"} each
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-[poppins] font-semibold mb-3">
              Payment Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{walkinData.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{walkinData.tax?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-red-600">
                  -₹{walkinData.discount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    ₹{walkinData.totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>₹{walkinData.amountPaid?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Amount:</span>
                <span className="font-bold text-red-600">
                  ₹{walkinData.dueAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default WalkinDetailsModal;
