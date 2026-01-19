// InlineEmployeeSelector.jsx - Employee selection modal for walk-in table
import React, { useState, useEffect } from "react";
import { Modal, Card, Table, Button, Input, Tag, message } from "antd";
import { Search, User, Check } from "lucide-react";
import api from "../../services/api";

const InlineEmployeeSelector = ({
  visible,
  onClose,
  walkin,
  onEmployeesSelected,
}) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (visible) {
      fetchAllEmployees();
      // Initialize with existing staff from services
      if (walkin?.services) {
        const existingStaff = walkin.services
          .map((s) => s.staff)
          .filter(Boolean)
          .map((staff) => ({
            _id: staff._id || staff,
            name: staff.name || "Unknown",
            employeeRole: staff.employeeRole || "",
            employeeId: staff.employeeId || "",
          }));
        setSelectedEmployees(existingStaff);
      }
    }
  }, [visible, walkin]);

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      // Fetch all employees (no role filtering)
      const res = await api.get("/admin/users?role=employee");
      const employeeList = res.data.users || [];
      setEmployees(employeeList);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      message.error("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmployee = (employee) => {
    const isSelected = selectedEmployees.some(
      (e) => e._id === employee._id
    );

    if (isSelected) {
      setSelectedEmployees((prev) =>
        prev.filter((e) => e._id !== employee._id)
      );
      message.info(`Removed ${employee.name}`);
    } else {
      setSelectedEmployees((prev) => [...prev, employee]);
      message.success(`Added ${employee.name}`);
    }
  };

  const handleSave = () => {
    onEmployeesSelected(selectedEmployees);
    onClose();
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.employeeId?.toLowerCase().includes(search) ||
      emp.employeeRole?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Employee ID",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (id) => <Tag color="blue">{id || "N/A"}</Tag>,
    },
    {
      title: "Role",
      dataIndex: "employeeRole",
      key: "employeeRole",
      render: (role) => (
        <Tag color="purple">{role ? role.toUpperCase() : "N/A"}</Tag>
      ),
    },
    {
      title: "Location",
      dataIndex: "workingLocation",
      key: "workingLocation",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const isSelected = selectedEmployees.some(
          (e) => e._id === record._id
        );
        return (
          <Button
            type={isSelected ? "primary" : "default"}
            icon={isSelected ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
            onClick={() => handleToggleEmployee(record)}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      title={`Select Employees - ${walkin?.walkinNumber || ""}`}
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save Employees ({selectedEmployees.length})
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Search employees by name, email, ID, or role..."
          prefix={<Search className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />

        {/* Selected Employees Summary */}
        {selectedEmployees.length > 0 && (
          <Card size="small" className="bg-blue-50">
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((emp) => (
                <Tag
                  key={emp._id}
                  color="blue"
                  closable
                  onClose={() =>
                    setSelectedEmployees((prev) =>
                      prev.filter((e) => e._id !== emp._id)
                    )
                  }
                >
                  {emp.name} ({emp.employeeRole || "Staff"})
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Employees Table */}
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="_id"
          size="small"
        />
      </div>
    </Modal>
  );
};

export default InlineEmployeeSelector;
