// src/components/ui/Table.jsx

import React from "react";

/**
 * Table component
 * Props:
 * - columns: Array of { header: string, accessor: string, cell?: function }
 * - data: Array of objects
 * - emptyMessage: string to display when no data
 */
const Table = ({ columns, data, emptyMessage = "No data available" }) => {
  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-700 border-b"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row._id || rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {columns.map((col) => {
                const value = row[col.accessor];
                return (
                  <td
                    key={col.accessor}
                    className="px-4 py-2 text-sm text-gray-800 border-b"
                  >
                    {col.cell ? col.cell(value, row) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
