import React, { useState } from "react";
import axios from "axios";
import API_URL from "../config/api";

const LeaveRequest = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const leaveTypes = [
    "Vacation Leave",
    "Sick Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Bereavement Leave",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.leave_type ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.reason
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Get employee ID from email
      const profileResponse = await axios.get(
        "${API_URL}/api/employees/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const employee_id = profileResponse.data.data.id;

      // Submit leave request
      const response = await axios.post(
        "${API_URL}/api/timesheet/leave",
        {
          employee_id,
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Leave request submitted successfully!");
        setFormData({
          leave_type: "",
          start_date: "",
          end_date: "",
          reason: "",
        });
      }
    } catch (error) {
      console.error("Error submitting leave:", error);
      alert(error.response?.data?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Submit Leave Request
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Type *
            </label>
            <select
              name="leave_type"
              value={formData.leave_type}
              onChange={handleChange}
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
              placeholder="Please provide a detailed reason for your leave request..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Important Notes:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Submit leave requests at least 3 days in advance</li>
          <li>• Emergency leave can be filed on the same day</li>
          <li>• Check your leave balance before submitting</li>
          <li>• You will be notified once your request is processed</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaveRequest;
