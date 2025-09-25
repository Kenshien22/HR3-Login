import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";

const EmployeeShift = () => {
  const { user } = useContext(AuthContext);
  const [shifts, setShifts] = useState([
    { id: 1, name: "Morning Shift", start_time: "08:00", end_time: "17:00" },
    { id: 2, name: "Afternoon Shift", start_time: "13:00", end_time: "22:00" },
    { id: 3, name: "Night Shift", start_time: "22:00", end_time: "06:00" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.start_time || !formData.end_time) {
      alert("Please fill all fields");
      return;
    }

    setShifts((prev) => [...prev, { id: Date.now(), ...formData }]);
    setFormData({ name: "", start_time: "", end_time: "" });
    setShowForm(false);
    alert("Shift created successfully!");
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      setShifts((prev) => prev.filter((shift) => shift.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Employee Shift Creation</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "Create New Shift"}
        </button>
      </div>

      {/* Simple Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Shift Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2 border rounded dark:bg-gray-700"
                placeholder="e.g., Evening Shift"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_time: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_time: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Shift
            </button>
          </form>
        </div>
      )}

      {/* Simple List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Available Shifts</h3>
        </div>
        <div className="p-4 space-y-3">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div>
                <div className="font-medium">{shift.name}</div>
                <div className="text-sm text-gray-500">
                  {shift.start_time} - {shift.end_time}
                </div>
              </div>
              <button
                onClick={() => handleDelete(shift.id, shift.name)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeShift;
