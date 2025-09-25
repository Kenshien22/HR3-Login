import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";

const EmployeeClaimsSubmission = () => {
  const { user } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    fetchClaims();
  }, [selectedStatus, selectedType, selectedDepartment]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      // Empty array for now - will be populated when employee panel is ready
      setClaims([]);
      // TODO: Connect to actual API endpoint when backend is ready
      // const response = await axios.get('/api/claims');
      // setClaims(response.data);
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId) => {
    if (window.confirm("Approve this claim?")) {
      // API call to approve
      alert(`Claim #${claimId} approved successfully!`);
      fetchClaims();
    }
  };

  const handleReject = async (claimId) => {
    const reason = prompt("Please provide reason for rejection:");
    if (reason) {
      // API call to reject
      alert(`Claim #${claimId} rejected.`);
      fetchClaims();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Medical":
        return "bg-blue-50 text-blue-600";
      case "Travel":
        return "bg-purple-50 text-purple-600";
      case "Training":
        return "bg-green-50 text-green-600";
      case "Meal":
        return "bg-orange-50 text-orange-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const pendingClaims = claims.filter((c) => c.status === "Pending");
  const totalAmount = claims.reduce((sum, c) => sum + c.amount, 0);
  const approvedAmount = claims
    .filter((c) => c.status === "Approved")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Claims Submission Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve employee expense claims
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
          <span className="text-yellow-600 font-medium">
            {pendingClaims.length} Pending Approval
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700"
            >
              <option value="all">All Types</option>
              <option value="Medical">Medical</option>
              <option value="Travel">Travel</option>
              <option value="Training">Training</option>
              <option value="Meal">Meal</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700"
            >
              <option value="all">All Departments</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {claims.length}
          </div>
          <div className="text-sm text-blue-700">Total Claims</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {pendingClaims.length}
          </div>
          <div className="text-sm text-yellow-700">Pending Review</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            ₱{totalAmount.toLocaleString()}
          </div>
          <div className="text-sm text-purple-700">Total Amount</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ₱{approvedAmount.toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Approved Amount</div>
        </div>
      </div>

      {/* Pending Claims for Approval */}
      {pendingClaims.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 border-b bg-yellow-50 dark:bg-yellow-900/20">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Claims Pending Approval
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-lg">
                          {claim.employee_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {claim.employee_id} • {claim.department}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                          claim.claim_type
                        )}`}
                      >
                        {claim.claim_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">
                          Claim Date:
                        </span>
                        <p className="font-medium">{claim.claim_date}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Amount:</span>
                        <p className="font-medium text-lg">
                          ₱{claim.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Receipt #:
                        </span>
                        <p className="font-medium">{claim.receipt_number}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-sm text-gray-500">
                        Description:
                      </span>
                      <p className="mt-1">{claim.description}</p>
                    </div>

                    {claim.attachments && claim.attachments.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Attachments:</span>
                        {claim.attachments.map((file, idx) => (
                          <button
                            key={idx}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {file}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleApprove(claim.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(claim.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Reject
                    </button>
                    <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Claims Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-medium">All Claims History</h3>
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
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Claim Date
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
              {claims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3">CLM-00{claim.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{claim.employee_name}</div>
                      <div className="text-xs text-gray-500">
                        {claim.employee_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{claim.department}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                        claim.claim_type
                      )}`}
                    >
                      {claim.claim_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ₱{claim.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{claim.claim_date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-500 hover:text-blue-700 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeClaimsSubmission;
