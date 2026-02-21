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
// ✅ FIX: Employees data "guaranteed fetch" with multiple endpoints + proper response parsing
// ✅ Shows clear error if API blocked (401/403/404)
// ✅ No change in overall feature (still select/deselect + save)

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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ response parser (handles many backend shapes)
  const extractArray = (res) => {
    const root = res?.data || {};
    const payload =
      root.users ||
      root.employees ||
      root.data?.users ||
      root.data?.employees ||
      root.data ||
      root.results ||
      root.items ||
      root.list ||
      [];

    return Array.isArray(payload) ? payload : [];
  };

  // ✅ normalize id + basic cleanup
  const normalize = (arr) => {
    return (Array.isArray(arr) ? arr : [])
      .filter(Boolean)
      .map((u) => ({
        ...u,
        _id: u._id || u.id,
      }))
      .filter((u) => u._id);
  };

  // ✅ fallback employee detector (in case endpoint returns all users)
  const isEmployee = (u) => {
    const role = (u?.role || u?.userRole || u?.type || "")
      .toString()
      .toLowerCase();
    const rolesArr = Array.isArray(u?.roles)
      ? u.roles.map((r) => String(r).toLowerCase())
      : [];
    const employeeRole = (u?.employeeRole || "").toString().toLowerCase();

    return (
      role === "employee" ||
      role === "staff" ||
      rolesArr.includes("employee") ||
      rolesArr.includes("staff") ||
      employeeRole.length > 0
    );
  };

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);

      // ✅ try filtered first, then broad endpoints
      const endpoints = [
        "/admin/users?role=employee",
        "/admin/users?type=employee",
        "/admin/users", // broad -> filter client-side
        "/users?role=employee",
        "/users?type=employee",
        "/users", // broad -> filter client-side
        "/employees",
        "/staff",
      ];

      let lastError = null;

      for (const url of endpoints) {
        try {
          const res = await api.get(url);

          let list = normalize(extractArray(res));

          // if broad list, filter to employees
          if (url === "/admin/users" || url === "/users") {
            list = list.filter(isEmployee);
          }

          if (list.length) {
            setEmployees(list);
            return;
          }
        } catch (e) {
          lastError = e;
        }
      }

      // ✅ nothing found -> show clear error
      const status = lastError?.response?.status;
      const msg =
        lastError?.response?.data?.message ||
        lastError?.message ||
        "No employees found / API blocked";

      message.error(
        `Employees load failed${status ? ` (HTTP ${status})` : ""}: ${msg}`
      );
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;

    // ✅ load employees
    fetchAllEmployees();

    // ✅ Initialize with existing staff from services
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
              email: "",
              workingLocation: "",
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
        .filter((x) => x._id);

      setSelectedEmployees(existingStaff);
    } else {
      setSelectedEmployees([]);
    }
  }, [visible, walkin]);

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
          placeholder="Search employees by name, email, ID, role, location..."
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