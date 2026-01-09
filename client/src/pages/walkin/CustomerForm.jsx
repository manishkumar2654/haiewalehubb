import React from "react";
import { User, Phone, Mail, MapPin, Building, Navigation } from "lucide-react";
import { Input, Select, Card, Tag } from "antd";

const { Option } = Select;

const CustomerForm = ({ formData, setFormData, branches, branchDetails }) => {
  return (
    <div className="space-y-6">
      {/* Branch Info Card */}
      {branchDetails.name && (
        <Card size="small" className="bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800">
                {branchDetails.name} Branch
              </h4>
              {branchDetails.address && (
                <p className="text-sm text-blue-700 mt-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {branchDetails.address}
                </p>
              )}
              {branchDetails.phone && (
                <p className="text-sm text-blue-700">
                  <Phone className="w-3 h-3 inline mr-1" />
                  {branchDetails.phone}
                </p>
              )}
            </div>
            {branchDetails.premium && (
              <Tag color="gold" className="ml-2">
                Premium
              </Tag>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-[poppins] text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Customer Name *
          </label>
          <Input
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            placeholder="Enter customer name"
            size="large"
          />
        </div>

        <div>
          <label className="block font-[poppins] text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number *
          </label>
          <Input
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
            placeholder="Enter phone number"
            size="large"
          />
        </div>

        <div>
          <label className="block font-[poppins] text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <Input
            value={formData.customerEmail}
            onChange={(e) =>
              setFormData({ ...formData, customerEmail: e.target.value })
            }
            placeholder="Enter email address"
            size="large"
          />
        </div>

        <div>
          <label className="block font-[poppins] text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Branch *
          </label>
          <Select
            value={formData.branch}
            onChange={(value) => setFormData({ ...formData, branch: value })}
            style={{ width: "100%" }}
            size="large"
            placeholder="Select branch"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {branches.map((branch) => (
              <Option key={branch._id} value={branch.name}>
                {branch.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="block font-[poppins] text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Customer Address *
        </label>
        <Input.TextArea
          value={formData.customerAddress}
          onChange={(e) =>
            setFormData({ ...formData, customerAddress: e.target.value })
          }
          placeholder="Enter customer's complete address"
          rows={3}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Please enter the complete address including street, city, and postal
          code
        </p>
      </div>
      <div>
        <label className="block font-[poppins] text-gray-700 mb-2">
          Additional Notes
        </label>
        <Input.TextArea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any special instructions or notes"
          rows={2}
        />
      </div>
    </div>
  );
};

export default CustomerForm;
