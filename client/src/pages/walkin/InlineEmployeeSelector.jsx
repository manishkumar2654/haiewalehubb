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





// InlineEmployeeSelector.jsx - EmployeeRole selection modal (using EmployeeRole collection)
import React, { useState, useEffect, useMemo } from "react";
import { Modal, Card, Table, Button, Input, Tag, message } from "antd";
import { Search, User, Check } from "lucide-react";
import api from "../../services/api";

const InlineEmployeeSelector = ({
  visible,
  onClose,
  walkin,
  onEmployeesSelected,
}) => {
  const [employees, setEmployees] = useState([]); // ✅ here "employees" = EmployeeRoles list
  const [selectedEmployees, setSelectedEmployees] = useState([]); // selected roles
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Extract array from any response shape
  const extractArray = (res) => {
    const root = res?.data || {};
    const payload =
      root.data ||
      root.users ||
      root.employees ||
      root.roles ||
      root.employeeRoles ||
      root.items ||
      root.results ||
      [];
    return Array.isArray(payload) ? payload : [];
  };

  // ✅ Normalize EmployeeRole -> usable rows
  const normalizeRoles = (arr) => {
    return (Array.isArray(arr) ? arr : [])
      .filter(Boolean)
      .map((r) => ({
        ...r,
        _id: r._id || r.id,
        name: r.name || "N/A",
        description: r.description || "",
        permissions: Array.isArray(r.permissions) ? r.permissions : [],
        isActive: typeof r.isActive === "boolean" ? r.isActive : true,
      }))
      .filter((r) => r._id);
  };

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);

      // ✅ Try common endpoints for EmployeeRole collection
      const endpoints = [
        "/employee-roles",
        "/employeeRoles",
        "/employeeroles",
        "/employee-role",
        "/admin/employee-roles",
        "/admin/employeeroles",
      ];

      let lastError = null;

      for (const url of endpoints) {
        try {
          const res = await api.get(url);
          const list = normalizeRoles(extractArray(res));
          if (list.length) {
            setEmployees(list);
            return;
          }
        } catch (e) {
          lastError = e;
        }
      }

      const status = lastError?.response?.status;
      const msg =
        lastError?.response?.data?.message ||
        lastError?.message ||
        "EmployeeRole endpoint not working";
      message.error(
        `Employee roles load failed${status ? ` (HTTP ${status})` : ""}: ${msg}`
      );
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;

    fetchAllEmployees();

    // ✅ Preselect (optional): if walkin has existing staff/roles saved
    if (walkin?.services) {
      const existing = walkin.services
        .map((s) => s?.staff)
        .filter(Boolean)
        .map((staff) => {
          if (typeof staff === "string") {
            return { _id: staff, name: "Unknown", description: "" };
          }
          return {
            _id: staff._id || staff.id || staff,
            name: staff.name || "Unknown",
            description: staff.description || "",
          };
        })
        .filter((x) => x._id);

      setSelectedEmployees(existing);
    } else {
      setSelectedEmployees([]);
    }
  }, [visible, walkin]);

  const handleToggleEmployee = (role) => {
    const isSelected = selectedEmployees.some((e) => e._id === role._id);

    if (isSelected) {
      setSelectedEmployees((prev) => prev.filter((e) => e._id !== role._id));
      message.info(`Removed ${role.name}`);
    } else {
      setSelectedEmployees((prev) => [...prev, role]);
      message.success(`Added ${role.name}`);
    }
  };

  const handleSave = () => {
    onEmployeesSelected(selectedEmployees);
    onClose();
  };

  const filteredEmployees = useMemo(() => {
    const list = employees || [];
    if (!searchTerm) return list;

    const s = searchTerm.toLowerCase();
    return list.filter((r) => {
      return (
        r.name?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s) ||
        (r.permissions || []).join(",").toLowerCase().includes(s)
      );
    });
  }, [employees, searchTerm]);

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">
            {record.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (d) => (d ? d : "—"),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms) => (
        <Tag color={perms?.length ? "blue" : "default"}>
          {perms?.length ? `${perms.length} perms` : "No perms"}
        </Tag>
      ),
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
      title={`Select Employee Roles - ${walkin?.walkinNumber || ""}`}
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save ({selectedEmployees.length})
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Input
          placeholder="Search by role name / description / permission..."
          prefix={<Search className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />

        {selectedEmployees.length > 0 && (
          <Card size="small" className="bg-blue-50">
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((r) => (
                <Tag
                  key={r._id}
                  color="blue"
                  closable
                  onClose={() =>
                    setSelectedEmployees((prev) =>
                      prev.filter((e) => e._id !== r._id)
                    )
                  }
                >
                  {r.name}
                </Tag>
              ))}
            </div>
          </Card>
        )}

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