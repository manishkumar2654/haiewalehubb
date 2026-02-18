import React from "react";
import { Modal, Button, QRCode, message, Tag } from "antd";
import {
  Download,
  Printer,
  Share2,
  MessageCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

const QRModal = ({ visible, qrData, onClose, onDownloadPDF }) => {
  // Create direct PDF download URL
  const directPdfUrl = `${window.location.origin}/api/v1/walkins/${qrData.walkinId}/pdf`;

  // Create user-friendly URL for display
  const displayUrl = `${window.location.host}/api/v1/walkins/${qrData.walkinId}/pdf`;

  const handlePrint = () => {
    const printWindow = window.open(directPdfUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `Walk-in Receipt: ${qrData.walkinNumber}`,
        text: `Your walk-in receipt from Hair Hub Luxury\nWalk-in: ${
          qrData.walkinNumber
        }\nCustomer: ${qrData.customerName}\nAmount: ₹${
          qrData.totalAmount?.toFixed(2) || "0.00"
        }`,
        url: directPdfUrl,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        message.success("Shared successfully!");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(directPdfUrl);
        message.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        // Fallback to copy if share fails
        await navigator.clipboard.writeText(directPdfUrl);
        message.success("Link copied to clipboard!");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directPdfUrl);
      message.success("Link copied to clipboard!");
    } catch (error) {
      message.error("Failed to copy link");
    }
  };

  const handleSendSMS = () => {
    const smsText = `Your Luxury Spa receipt is ready:\nWalk-in: ${
      qrData.walkinNumber
    }\nCustomer: ${qrData.customerName}\nAmount: ₹${qrData.totalAmount?.toFixed(
      2
    )}\nDownload: ${directPdfUrl}`;
    const smsUrl = `sms:?body=${encodeURIComponent(smsText)}`;
    window.open(smsUrl, "_blank");
  };

  const handleOpenLink = () => {
    window.open(directPdfUrl, "_blank");
  };

  const handleTestScan = () => {
    Modal.info({
      title: "Test QR Scanning",
      content: (
        <div className="space-y-4">
          <p>
            <strong>To test QR functionality:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Open camera app on your phone</li>
            <li>Point camera at this QR code</li>
            <li>Tap the notification/link that appears</li>
            <li>PDF should download automatically</li>
          </ol>
          <div className="bg-yellow-50 p-3 rounded mt-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Some phones may require you to tap the link
              manually after scanning.
            </p>
          </div>
        </div>
      ),
      okText: "Got it",
      width: 400,
    });
  };

  const handleScanInstructions = () => {
    Modal.info({
      title: "How to Use QR Code",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-semibold text-blue-800 mb-2">For Customers:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open camera app on your phone</li>
              <li>Point camera at the QR code</li>
              <li>Tap the link notification that appears</li>
              <li>PDF receipt will download automatically</li>
              <li>Save PDF for your records</li>
            </ol>
          </div>

          <div className="bg-green-50 p-3 rounded">
            <p className="font-semibold text-green-800 mb-2">For Staff:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Show this QR to customer after service</li>
              <li>Customer scans with phone camera</li>
              <li>No app installation required</li>
              <li>Digital receipt replaces paper bill</li>
            </ul>
          </div>

          <div className="bg-red-50 p-3 rounded">
            <p className="font-semibold text-red-800 mb-2">Troubleshooting:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure good lighting for scanning</li>
              <li>Move phone closer/further if needed</li>
              <li>Use alternative methods if QR fails</li>
              <li>Contact staff for printed receipt</li>
            </ul>
          </div>
        </div>
      ),
      okText: "Close",
      width: 500,
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <span className="text-xl">📄</span>
            <span className="ml-2">
              Digital Receipt - #{qrData.walkinNumber}
            </span>
          </span>
          <Tag color="blue" className="ml-2">
            Paperless
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={550}
      className="qr-modal"
    >
      <div className="space-y-6">
        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
          <div className="mb-4 p-6 bg-white border-2 border-dashed border-blue-200 rounded-xl shadow-lg">
            <QRCode
              value={directPdfUrl} // Direct PDF URL in QR
              size={240}
              level="H"
              color="#1e40af"
              bgColor="transparent"
              iconSize={40}
            />
          </div>

          <div className="text-center bg-white p-4 rounded-lg shadow-sm w-full max-w-md">
            <p className="text-lg font-semibold text-gray-800 mb-1">
              Scan to Download Receipt
            </p>
            <p className="text-sm text-gray-600 mb-3">
              No app required • Works with phone camera
            </p>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Walk-in #</p>
                <p className="font-semibold">{qrData.walkinNumber}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-semibold truncate">{qrData.customerName}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-semibold text-green-600">
                  ₹{qrData.totalAmount?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold">
                  {new Date(qrData.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Direct Link Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 mb-1">Direct Link:</p>
              <div className="flex items-center bg-white p-2 rounded border">
                <code className="text-xs text-gray-600 truncate flex-1">
                  {displayUrl}
                </code>
                <Button
                  type="text"
                  size="small"
                  icon={<Copy className="w-3 h-3" />}
                  onClick={handleCopyLink}
                  title="Copy link"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            type="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={onDownloadPDF}
            size="large"
            className="h-12"
            block
          >
            Download PDF
          </Button>

          <Button
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={handleOpenLink}
            size="large"
            className="h-12"
            block
          >
            Open in Browser
          </Button>

          <Button
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            size="large"
            className="h-12"
            block
          >
            Print
          </Button>

          <Button
            icon={<Share2 className="w-4 h-4" />}
            onClick={handleShare}
            size="large"
            className="h-12"
            block
          >
            Share
          </Button>

          <Button
            icon={<MessageCircle className="w-4 h-4" />}
            onClick={handleSendSMS}
            size="large"
            className="h-12"
            block
          >
            Send via SMS
          </Button>

          <Button
            type="dashed"
            onClick={handleTestScan}
            size="large"
            className="h-12"
            block
          >
            Test Scan
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-800 text-lg flex items-center">
              <span className="mr-2">📱</span>
              How to Use
            </h4>
            <Button
              type="link"
              size="small"
              onClick={handleScanInstructions}
              className="text-blue-600"
            >
              Detailed Guide →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">1</span>
                </div>
                <p className="font-medium">Scan QR Code</p>
              </div>
              <p className="text-sm text-gray-600">
                Use phone camera to scan the QR code
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-green-600 text-sm">2</span>
                </div>
                <p className="font-medium">Tap Link</p>
              </div>
              <p className="text-sm text-gray-600">
                Tap the notification/link that appears
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-purple-600 text-sm">3</span>
                </div>
                <p className="font-medium">Download PDF</p>
              </div>
              <p className="text-sm text-gray-600">
                PDF receipt downloads automatically
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-amber-600 text-sm">4</span>
                </div>
                <p className="font-medium">Save/Share</p>
              </div>
              <p className="text-sm text-gray-600">
                Save PDF or share with family
              </p>
            </div>
          </div>
        </div>

        {/* Compatibility Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-700">Compatible with:</p>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-white rounded text-xs border">
                iPhone
              </span>
              <span className="px-2 py-1 bg-white rounded text-xs border">
                Android
              </span>
              <span className="px-2 py-1 bg-white rounded text-xs border">
                All QR Apps
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Works with native camera apps on iOS 11+ and Android 8+. No
            additional apps required for customers.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600 mb-1">
            Hair Hub Luxury • Digital Receipt System
          </p>
          <p className="text-xs text-gray-400">
            Eco-friendly • Paperless • Instant Delivery
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default QRModal;
