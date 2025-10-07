import React, { useState, useEffect } from "react";
import axios from "axios";
import ClaimDetailModal from "./ClaimDetailModal";
import API_URL from "../config/api";

const EmployeeReimbursement = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReimbursements();
  }, [filter]);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("${API_URL}/api/claims", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Only show APPROVED claims
        const approvedClaims = response.data.data.filter(
          (claim) => claim.status === "Approved"
        );
        setReimbursements(approvedClaims);
      }
    } catch (error) {
      console.error("Error fetching reimbursements:", error);
    } finally {
      setLoading(false);
    }
  };

  const processReimbursement = (id) => {
    if (window.confirm("Process this reimbursement?")) {
      alert("Reimbursement processed!");
      fetchReimbursements();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Employee Reimbursement</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Process and track employee reimbursements
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded dark:bg-gray-700"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {reimbursements.filter((r) => r.status === "Processing").length}
          </div>
          <div className="text-sm text-orange-700">Processing</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {reimbursements.filter((r) => r.status === "Completed").length}
          </div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            ₱
            {reimbursements
              .reduce((sum, r) => sum + r.amount, 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-blue-700">Total Amount</div>
        </div>
      </div>

      {/* Reimbursements Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-medium">Reimbursement Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Claim ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Payment Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reimbursements.map((reimb) => (
                <tr
                  key={reimb.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 font-medium">CLM-00{reimb.id}</td>
                  <td className="px-4 py-3">{reimb.employee_name}</td>
                  <td className="px-4 py-3">
                    ₱{reimb.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">Bank Transfer</td>
                  <td className="px-4 py-3">
                    {reimb.approved_date
                      ? new Date(reimb.approved_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{reimb.receipt_number || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Approved
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedClaim(reimb);
                        setShowModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => {
            setShowModal(false);
            setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeReimbursement;
