import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import API_URL from "../config/api";

const LeaveApproval = () => {
  const { user } = useContext(AuthContext);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("${API_URL}/api/leaves/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPendingLeaves(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (leaveId, status, remarks = "") => {
    try {
      setProcessing(leaveId);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/leaves/${leaveId}/status`,
        { status, remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove from pending list
        setPendingLeaves((prev) =>
          prev.filter((leave) => leave.id !== leaveId)
        );
        showNotification(`Leave request ${status.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      showNotification("Error updating leave status", "error");
    } finally {
      setProcessing(null);
    }
  };

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
    notification.className = `fixed top-4 right-4 ${bgColor} text-white p-3 rounded shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Leave Approval</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve employee leave requests
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
          <span className="text-blue-600 font-medium">
            {pendingLeaves.length} Pending Requests
          </span>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-medium">Pending Leave Requests</h3>
        </div>

        {pendingLeaves.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingLeaves.map((leave) => (
              <div key={leave.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-lg">
                          {leave.employee_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {leave.department} • {leave.position}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        {leave.leave_type}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">
                          Start Date:
                        </span>
                        <p className="font-medium">
                          {formatDate(leave.start_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">End Date:</span>
                        <p className="font-medium">
                          {formatDate(leave.end_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Duration:</span>
                        <p className="font-medium">
                          {leave.days_requested} days
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Reason:</span>
                      <p className="mt-1 text-gray-800 dark:text-gray-200">
                        {leave.reason}
                      </p>
                    </div>

                    <div className="text-xs text-gray-500">
                      Submitted: {formatDate(leave.createdAt)}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleApproval(leave.id, "Approved")}
                      disabled={processing === leave.id}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      {processing === leave.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => {
                        const remarks = prompt(
                          "Reason for rejection (optional):"
                        );
                        if (remarks !== null) {
                          handleApproval(leave.id, "Rejected", remarks);
                        }
                      }}
                      disabled={processing === leave.id}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m6 0h6m-6 6v6m0 0v6m0-6h6m-6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No pending requests
            </h3>
            <p className="text-gray-500">
              All leave requests have been processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;
