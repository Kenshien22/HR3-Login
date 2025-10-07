import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";

const EmployeeScheduleView = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const fetchMySchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("${API_URL}/api/my-schedule", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSchedule(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">My Weekly Schedule</h3>

      {schedule.length === 0 ? (
        <p className="text-gray-500">No schedule assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {schedule.map((item) => (
            <div key={item.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-lg">
                    {new Date(item.schedule_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.Shift?.name || "No shift"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {item.Shift?.start_time} - {item.Shift?.end_time}
                  </p>
                  <p className="text-xs text-gray-500">{item.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeScheduleView;
