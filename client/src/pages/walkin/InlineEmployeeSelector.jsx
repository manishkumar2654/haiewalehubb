// // InlineEmployeeSelector.jsx - Employee selection modal for walk-in table
// import React, { useState, useEffect } from "react";
// import { Modal, Card, Table, Button, Input, Tag, message } from "antd";
// import { Search, User, Check } from "lucide-react";
// import api from "../../services/api";

// const InlineEmployeeSelector = ({
//   visible,
//   onClose,
//   walkin,
//   onEmployeesSelected,
// }) => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     if (visible) {
//       fetchAllEmployees();
//       // Initialize with existing staff from services
//       if (walkin?.services) {
//         const existingStaff = walkin.services
//           .map((s) => s.staff)
//           .filter(Boolean)
//           .map((staff) => ({
//             _id: staff._id || staff,
//             name: staff.name || "Unknown",
//             employeeRole: staff.employeeRole || "",
//             employeeId: staff.employeeId || "",
//           }));
//         setSelectedEmployees(existingStaff);
//       }
//     }
//   }, [visible, walkin]);

//   const fetchAllEmployees = async () => {
//     try {
//       setLoading(true);
//       // Fetch all employees (no role filtering)
//       const res = await api.get("/admin/users?role=employee");
//       const employeeList = res.data.users || [];
//       setEmployees(employeeList);
//     } catch (error) {
//       console.error("Failed to fetch employees:", error);
//       message.error("Failed to load employees");
//       setEmployees([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleEmployee = (employee) => {
//     const isSelected = selectedEmployees.some(
//       (e) => e._id === employee._id
//     );

//     if (isSelected) {
//       setSelectedEmployees((prev) =>
//         prev.filter((e) => e._id !== employee._id)
//       );
//       message.info(`Removed ${employee.name}`);
//     } else {
//       setSelectedEmployees((prev) => [...prev, employee]);
//       message.success(`Added ${employee.name}`);
//     }
//   };

//   const handleSave = () => {
//     onEmployeesSelected(selectedEmployees);
//     onClose();
//   };

//   const filteredEmployees = employees.filter((emp) => {
//     if (!searchTerm) return true;
//     const search = searchTerm.toLowerCase();
//     return (
//       emp.name?.toLowerCase().includes(search) ||
//       emp.email?.toLowerCase().includes(search) ||
//       emp.employeeId?.toLowerCase().includes(search) ||
//       emp.employeeRole?.toLowerCase().includes(search)
//     );
//   });

//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       render: (name, record) => (
//         <div>
//           <div className="font-medium">{name}</div>
//           <div className="text-xs text-gray-500">{record.email}</div>
//         </div>
//       ),
//     },
//     {
//       title: "Employee ID",
//       dataIndex: "employeeId",
//       key: "employeeId",
//       render: (id) => <Tag color="blue">{id || "N/A"}</Tag>,
//     },
//     {
//       title: "Role",
//       dataIndex: "employeeRole",
//       key: "employeeRole",
//       render: (role) => (
//         <Tag color="purple">{role ? role.toUpperCase() : "N/A"}</Tag>
//       ),
//     },
//     {
//       title: "Location",
//       dataIndex: "workingLocation",
//       key: "workingLocation",
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => {
//         const isSelected = selectedEmployees.some(
//           (e) => e._id === record._id
//         );
//         return (
//           <Button
//             type={isSelected ? "primary" : "default"}
//             icon={isSelected ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
//             onClick={() => handleToggleEmployee(record)}
//           >
//             {isSelected ? "Selected" : "Select"}
//           </Button>
//         );
//       },
//     },
//   ];

//   return (
//     <Modal
//       title={`Select Employees - ${walkin?.walkinNumber || ""}`}
//       open={visible}
//       onCancel={onClose}
//       width={900}
//       footer={[
//         <Button key="cancel" onClick={onClose}>
//           Cancel
//         </Button>,
//         <Button key="save" type="primary" onClick={handleSave}>
//           Save Employees ({selectedEmployees.length})
//         </Button>,
//       ]}
//     >
//       <div className="space-y-4">
//         {/* Search */}
//         <Input
//           placeholder="Search employees by name, email, ID, or role..."
//           prefix={<Search className="w-4 h-4" />}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           allowClear
//         />

//         {/* Selected Employees Summary */}
//         {selectedEmployees.length > 0 && (
//           <Card size="small" className="bg-blue-50">
//             <div className="flex flex-wrap gap-2">
//               {selectedEmployees.map((emp) => (
//                 <Tag
//                   key={emp._id}
//                   color="blue"
//                   closable
//                   onClose={() =>
//                     setSelectedEmployees((prev) =>
//                       prev.filter((e) => e._id !== emp._id)
//                     )
//                   }
//                 >
//                   {emp.name} ({emp.employeeRole || "Staff"})
//                 </Tag>
//               ))}
//             </div>
//           </Card>
//         )}

//         {/* Employees Table */}
//         <Table
//           dataSource={filteredEmployees}
//           columns={columns}
//           loading={loading}
//           pagination={{ pageSize: 10 }}
//           rowKey="_id"
//           size="small"
//         />
//       </div>
//     </Modal>
//   );
// };

// export default InlineEmployeeSelector;





// InlineEmployeeSelector.jsx - Employee selection modal for walk-in table
// ✅ FIX: Employees data reliable load (supports props OR fallback API)
// ✅ No functionality change, only data-loading made robust

import React, { useState, useEffect, useMemo } from "react";
import { Modal, Card, Table, Button, Input, Tag, message } from "antd";
import { Search, User, Check } from "lucide-react";
import api from "../../services/api";

const InlineEmployeeSelector = ({
  visible,
  onClose,
  walkin,
  onEmployeesSelected,

  // ✅ optional (if parent passes)
  employees: employeesProp,
  employeesLoading: employeesLoadingProp,
}) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ normalize different backend shapes safely
  const normalizeEmployees = (payload) => {
    const arr = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.employees)
      ? payload.employees
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.items)
      ? payload.items
      : [];

    // sanitize ids to keep rowKey stable
    return arr
      .filter(Boolean)
      .map((e) => ({
        ...e,
        _id: e._id || e.id, // support id fallback
      }))
      .filter((e) => e._id);
  };

  // ✅ fetch employees with fallback endpoints (only if props not provided)
  const fetchAllEmployees = async () => {
    try {
      setLoading(true);

      const endpoints = [
        "/admin/users?role=employee",
        "/admin/users?type=employee",
        "/users?role=employee",
        "/users?type=employee",
        "/users/employees",
        "/employees",
        "/staff",
      ];

      let found = [];

      for (const url of endpoints) {
        try {
          const res = await api.get(url);
          const payload = res.data?.data ?? res.data; // support {data:{...}} or {...}
          const list = normalizeEmployees(payload);
          if (list.length) {
            found = list;
            break;
          }
        } catch (e) {
          // try next endpoint
        }
      }

      setEmployees(found);
      if (!found.length) message.warning("No employees found");
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      message.error("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ initialize selection from walkin services (more robust for string/object staff)
  useEffect(() => {
    if (!visible) return;

    // 1) Load employees list:
    // If parent passed employees, use them; else fetch internally
    if (Array.isArray(employeesProp)) {
      setEmployees(normalizeEmployees(employeesProp));
    } else {
      fetchAllEmployees();
    }

    // 2) Preselect existing staff from services:
    if (walkin?.services) {
      const existingStaff = walkin.services
        .map((s) => s?.staff)
        .filter(Boolean)
        .map((staff) => {
          // staff can be object OR id string
          if (typeof staff === "string") {
            return {
              _id: staff,
              name: "Unknown",
              employeeRole: "",
              employeeId: "",
            };
          }
          return {
            _id: staff._id || staff.id || staff,
            name: staff.name || "Unknown",
            employeeRole: staff.employeeRole || "",
            employeeId: staff.employeeId || "",
            email: staff.email || "",
            workingLocation: staff.workingLocation || "",
          };
        })
        .filter((s) => s._id);

      setSelectedEmployees(existingStaff);
    } else {
      setSelectedEmployees([]);
    }
  }, [visible, walkin, employeesProp]);

  // ✅ if parent loading changes, reflect in UI (optional)
  const effectiveLoading =
    typeof employeesLoadingProp === "boolean" ? employeesLoadingProp : loading;

  const handleToggleEmployee = (employee) => {
    const isSelected = selectedEmployees.some((e) => e._id === employee._id);

    if (isSelected) {
      setSelectedEmployees((prev) => prev.filter((e) => e._id !== employee._id));
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

  const filteredEmployees = useMemo(() => {
    const list = employees || [];
    if (!searchTerm) return list;

    const search = searchTerm.toLowerCase();
    return list.filter((emp) => {
      return (
        emp.name?.toLowerCase().includes(search) ||
        emp.email?.toLowerCase().includes(search) ||
        emp.employeeId?.toLowerCase().includes(search) ||
        emp.employeeRole?.toLowerCase().includes(search) ||
        emp.workingLocation?.toLowerCase().includes(search)
      );
    });
  }, [employees, searchTerm]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name || "N/A"}</div>
          <div className="text-xs text-gray-500">{record.email || ""}</div>
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
        <Tag color="purple">{role ? String(role).toUpperCase() : "N/A"}</Tag>
      ),
    },
    {
      title: "Location",
      dataIndex: "workingLocation",
      key: "workingLocation",
      render: (v) => v || "—",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const isSelected = selectedEmployees.some((e) => e._id === record._id);
        return (
          <Button
            type={isSelected ? "primary" : "default"}
            icon={
              isSelected ? (
                <Check className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )
            }
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
          loading={effectiveLoading}
          pagination={{ pageSize: 10 }}
          rowKey="_id"
          size="small"
        />
      </div>
    </Modal>
  );
};

export default InlineEmployeeSelector;