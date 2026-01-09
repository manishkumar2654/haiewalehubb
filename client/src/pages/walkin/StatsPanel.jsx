import React from "react";
import { Plus, Printer, Download } from "lucide-react";
import { Card } from "antd";

const StatsPanel = ({ formData, calculateTotals, resetForm, walkins }) => {
  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Quick Summary */}
      <Card className="shadow-lg">
        <h3 className="text-lg font-[philosopher] mb-4">Quick Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Services:</span>
            <span className="font-semibold">
              {formData.selectedServices.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Products:</span>
            <span className="font-semibold">
              {formData.selectedProducts.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estimated Total:</span>
            <span className="text-lg font-bold text-green-600">
              ₹{totals.total.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <h3 className="text-lg font-[philosopher] mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={resetForm}
            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Walk-in
          </button>
          <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </button>
          <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </Card>

      {/* Today's Stats */}
      <Card className="shadow-lg">
        <h3 className="text-lg font-[philosopher] mb-4">Today's Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {
                walkins.filter(
                  (w) =>
                    new Date(w.walkinDate).toDateString() ===
                    new Date().toDateString()
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Today's Walk-ins</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹
              {walkins
                .filter(
                  (w) =>
                    new Date(w.walkinDate).toDateString() ===
                    new Date().toDateString()
                )
                .reduce((sum, w) => sum + (w.totalAmount || 0), 0)
                .toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Today's Revenue</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsPanel;
