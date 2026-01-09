import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Edit2, Trash2, PlusCircle, X, Check, Building } from "lucide-react";

const capacities = [1, 2]; // Single (1) or Double (2) capacity
const types = ["Silver", "Gold", "Diamond"];
const statuses = ["Available", "Booked", "Maintenance"];

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]); // ✅ BRANCHES STATE ADDED
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRoom, setEditRoom] = useState(null);

  const [form, setForm] = useState({
    roomNumber: "",
    capacity: capacities[0],
    type: types[0],
    price: "",
    status: statuses[0],
    branch: "", // ✅ BRANCH FIELD ADDED (no more location field)
  });

  // Fetch all rooms and branches
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch rooms with branch details
      const roomsRes = await api.get("/admin/rooms");
      setRooms(roomsRes.data);

      // Fetch branches for dropdown
      const branchesRes = await api.get("/admin/branches");
      setBranches(branchesRes.data);

      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Input change handler
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Open form for new room
  const addNewRoom = () => {
    setForm({
      roomNumber: "",
      capacity: capacities[0],
      type: types[0],
      price: "",
      status: statuses[0],
      branch: branches.length > 0 ? branches[0]._id : "", // ✅ Default to first branch
    });
    setEditRoom(null);
    setIsEditing(false);
    setFormVisible(true);
  };

  // Open form to edit existing room
  const editExistingRoom = (room) => {
    setForm({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      type: room.type,
      price: room.price.toString(),
      status: room.status,
      branch: room.branch._id, // ✅ Branch ID from populated data
    });
    setEditRoom(room);
    setIsEditing(true);
    setFormVisible(true);
  };

  // Submit form handler
  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.roomNumber) {
      setError("Room Number is required");
      return;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    if (!form.branch) {
      setError("Please select a branch");
      return;
    }

    setLoading(true);
    try {
      const roomData = {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
      };

      if (isEditing) {
        const res = await api.put(`/admin/rooms/${editRoom._id}`, roomData);
        setRooms((r) =>
          r.map((room) => (room._id === editRoom._id ? res.data.room : room))
        );
      } else {
        const res = await api.post("/admin/rooms", roomData);
        setRooms((r) => [...r, res.data.room]);
      }

      setError(null);
      setFormVisible(false);
      setIsEditing(false);
      setEditRoom(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save room");
    }
    setLoading(false);
  };

  // Delete room
  const deleteRoom = async (room) => {
    if (
      !window.confirm(
        `Are you sure you want to delete room ${room.roomNumber}?`
      )
    )
      return;

    setLoading(true);
    try {
      await api.delete(`/admin/rooms/${room._id}`);
      setRooms((r) => r.filter((rm) => rm._id !== room._id));
    } catch {
      setError("Failed to delete room");
    }
    setLoading(false);
  };

  // Get branch name by ID
  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b._id === branchId);
    return branch ? branch.name : "Unknown";
  };

  // Get branch address by ID
  const getBranchAddress = (branchId) => {
    const branch = branches.find((b) => b._id === branchId);
    return branch ? branch.address : "";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-pink-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
          <p className="text-gray-600">
            Manage treatment rooms and assign branches
          </p>
        </div>
        <Button
          onClick={addNewRoom}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
        >
          <PlusCircle size={18} />
          <span>Add Room</span>
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {formVisible && (
        <Card className="mb-8 border border-pink-100 shadow-lg">
          <div className="px-6 py-4 border-b border-pink-100 bg-pink-50">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Edit Room" : "Add New Room"}
            </h3>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={onChange}
                  required
                  placeholder="e.g., G-101, D-201"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700"
                />
              </div>

              {/* ✅ BRANCH SELECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="branch"
                  value={form.branch}
                  onChange={onChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} Branch
                    </option>
                  ))}
                </select>
                {form.branch && (
                  <p className="text-xs text-gray-500 mt-1">
                    Address: {getBranchAddress(form.branch)}
                  </p>
                )}
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (Persons)
                </label>
                <select
                  name="capacity"
                  value={form.capacity}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700"
                >
                  {capacities.map((c) => (
                    <option key={c} value={c}>
                      {c} Person{c > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price - MANUAL ENTRY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={onChange}
                  min="0"
                  step="50"
                  required
                  placeholder="Enter room price"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Manual price entry (no auto-calculation)
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                onClick={() => {
                  setFormVisible(false);
                  setIsEditing(false);
                  setEditRoom(null);
                }}
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Check size={16} className="mr-2" />
                {isEditing ? "Update Room" : "Add Room"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rooms Table */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        {loading && !rooms.length ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg">No rooms available</p>
            <p className="mt-2">Click "Add Room" to create your first room</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Room Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr
                    key={room._id}
                    className="hover:bg-pink-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {room.roomNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            room.branch?.name === "Gold"
                              ? "bg-yellow-100 text-yellow-800"
                              : room.branch?.name === "Diamond"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {room.branch?.name || "Unknown"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {room.branch?.phone || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.capacity} Person{room.capacity > 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{room.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          room.status === "Available"
                            ? "bg-green-100 text-green-800"
                            : room.status === "Booked"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => editExistingRoom(room)}
                          variant="icon"
                          className="text-pink-600 hover:bg-pink-100"
                          size="sm"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          onClick={() => deleteRoom(room)}
                          variant="icon"
                          className="text-red-600 hover:bg-red-100"
                          size="sm"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Branches Summary */}
      {branches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Available Branches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((branch) => {
              const roomsInBranch = rooms.filter(
                (room) => room.branch?._id === branch._id
              );
              const availableRooms = roomsInBranch.filter(
                (room) => room.status === "Available"
              ).length;

              return (
                <div
                  key={branch._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">
                      {branch.name} Branch
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        branch.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {branch.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {branch.address.substring(0, 60)}...
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">📞 {branch.phone}</span>
                    <span className="text-gray-700">
                      🏠 {roomsInBranch.length} rooms ({availableRooms}{" "}
                      available)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
