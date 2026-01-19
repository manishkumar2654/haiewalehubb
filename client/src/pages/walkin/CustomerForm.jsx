import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Navigation,
  Sofa,
} from "lucide-react";
import { Input, Select, Card, Tag, Radio, Space, Alert, Badge } from "antd";
import api from "../../services/api";

const { Option } = Select;

const CustomerForm = ({ formData, setFormData, branches, branchDetails }) => {
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Jab branch change ho, fetch seats
  useEffect(() => {
    if (formData.branch) {
      fetchSeatsForBranch(formData.branch);
    }
  }, [formData.branch]);

  const fetchSeatsForBranch = async (branchName) => {
    try {
      setLoadingSeats(true);
      // Pehle branch ID find karo
      const selectedBranch = branches.find((b) => b.name === branchName);
      if (!selectedBranch) {
        setSeats([]);
        return;
      }

      // Ab seats fetch karo
      const res = await api.get(`/seats/branch/${selectedBranch._id}`);
      setSeats(res.data.data || []);
    } catch (error) {
      console.error("Seats fetch error:", error);
      setSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatSelect = (seatId) => {
    const selectedSeat = seats.find((s) => s._id === seatId);
    if (!selectedSeat) return;

    // Agar seat already selected hai to remove karo
    const isAlreadySelected = formData.selectedSeats?.some(
      (s) => s.seatId === seatId
    );

    if (isAlreadySelected) {
      // Remove seat
      setFormData((prev) => ({
        ...prev,
        selectedSeats:
          prev.selectedSeats?.filter((s) => s.seatId !== seatId) || [],
      }));
    } else {
      // Add seat
      setFormData((prev) => ({
        ...prev,
        selectedSeats: [
          ...(prev.selectedSeats || []),
          {
            seatId,
            seatNumber: selectedSeat.seatNumber,
            seatType: selectedSeat.seatType,
            duration: 1, // Default 1 hour
            price: getSeatPrice(selectedSeat.seatType),
            total: getSeatPrice(selectedSeat.seatType) * 1,
          },
        ],
      }));
    }
  };

  const getSeatPrice = (seatType) => {
    switch (seatType) {
      case "VIP":
        return 500;
      case "Premium":
        return 300;
      case "Couple":
        return 800;
      default:
        return 200;
    }
  };

  const getSeatColor = (status) => {
    switch (status) {
      case "Available":
        return "green";
      case "Booked":
        return "red";
      case "Maintenance":
        return "orange";
      case "Reserved":
        return "blue";
      default:
        return "gray";
    }
  };

  const updateSeatDuration = (seatId, duration) => {
    setFormData((prev) => ({
      ...prev,
      selectedSeats:
        prev.selectedSeats?.map((seat) =>
          seat.seatId === seatId
            ? {
                ...seat,
                duration,
                total: seat.price * duration,
              }
            : seat
        ) || [],
    }));
  };

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

      {/* Basic Customer Info */}
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

      {/* Seats Selection Section */}
      {formData.branch && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block font-[poppins] text-gray-700">
              <Sofa className="w-5 h-5 inline mr-2" />
              Select Seats ({seats.length} available)
            </label>
            {formData.selectedSeats?.length > 0 && (
              <Tag color="blue">
                {formData.selectedSeats.length} seat(s) selected
              </Tag>
            )}
          </div>

          {loadingSeats ? (
            <Alert message="Loading seats..." type="info" showIcon />
          ) : seats.length === 0 ? (
            <Alert
              message="No seats found for this branch"
              type="warning"
              showIcon
            />
          ) : (
            <>
              {/* Seat Status Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                  <span className="text-sm">Maintenance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm">Reserved</span>
                </div>
              </div>

              {/* Seats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {seats.map((seat) => {
                  const isSelected = formData.selectedSeats?.some(
                    (s) => s.seatId === seat._id
                  );
                  const isAvailable = seat.status === "Available";

                  return (
                    <div
                      key={seat._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-100 border-blue-400 ring-2 ring-blue-300"
                          : isAvailable
                          ? "bg-gray-50 hover:bg-gray-100 border-gray-200"
                          : "bg-gray-100 opacity-60 cursor-not-allowed border-gray-300"
                      }`}
                      onClick={() => isAvailable && handleSeatSelect(seat._id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Sofa className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="font-semibold">
                            {seat.seatNumber}
                          </span>
                        </div>
                        <Badge
                          color={getSeatColor(seat.status)}
                          text={seat.status}
                          size="small"
                        />
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-600">{seat.seatType}</div>
                        {seat.features?.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {seat.features.slice(0, 2).join(", ")}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="text-xs text-gray-600 mb-1">
                            Duration (hours):
                          </div>
                          <Radio.Group
                            size="small"
                            value={
                              formData.selectedSeats?.find(
                                (s) => s.seatId === seat._id
                              )?.duration || 1
                            }
                            onChange={(e) =>
                              updateSeatDuration(seat._id, e.target.value)
                            }
                          >
                            <Space direction="horizontal">
                              <Radio value={1}>1h</Radio>
                              <Radio value={2}>2h</Radio>
                              <Radio value={3}>3h</Radio>
                            </Space>
                          </Radio.Group>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Selected Seats Summary */}
          {formData.selectedSeats?.length > 0 && (
            <Card size="small" className="bg-amber-50 border-amber-200 mt-4">
              <h4 className="font-semibold text-amber-800 mb-2">
                Selected Seats
              </h4>
              <div className="space-y-2">
                {formData.selectedSeats.map((seat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">
                        Seat {seat.seatNumber}
                      </span>
                      <Tag color="blue" size="small" className="ml-2">
                        {seat.seatType}
                      </Tag>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{seat.total}</div>
                      <div className="text-xs text-gray-600">
                        ₹{seat.price}/h × {seat.duration}h
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Seats:</span>
                    <span className="text-green-600">
                      ₹
                      {formData.selectedSeats.reduce(
                        (sum, seat) => sum + seat.total,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Customer Address */}
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

      {/* Notes */}
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
