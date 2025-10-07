import React, { useState } from "react";
import axios from "axios";
import API_URL from "../config/api";

const ClaimsSubmission = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    claim_type: "",
    amount: "",
    claim_date: "",
    receipt_number: "",
    description: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const claimTypes = [
    "Medical",
    "Travel",
    "Training",
    "Meal",
    "Equipment",
    "Others",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.claim_type ||
      !formData.amount ||
      !formData.claim_date ||
      !formData.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Get employee ID
      const profileResponse = await axios.get(
        "${API_URL}/api/employees/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const employee_id = profileResponse.data.data.id;

      // Submit claim with file
      const submitData = new FormData();
      submitData.append("employee_id", employee_id);
      submitData.append("claim_type", formData.claim_type);
      submitData.append("amount", parseFloat(formData.amount));
      submitData.append("claim_date", formData.claim_date);
      submitData.append("receipt_number", formData.receipt_number);
      submitData.append("description", formData.description);

      if (receiptFile) {
        submitData.append("receipt_image", receiptFile);
      }

      const response = await axios.post("${API_URL}/api/claims", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        alert("Claim submitted successfully!");
        setFormData({
          claim_type: "",
          amount: "",
          claim_date: "",
          receipt_number: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert(error.response?.data?.message || "Failed to submit claim");
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
          Submit Expense Claim
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Claim Type *
              </label>
              <select
                name="claim_type"
                value={formData.claim_type}
                onChange={handleChange}
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
                required
              >
                <option value="">Select Claim Type</option>
                {claimTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₱) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Claim Date *
              </label>
              <input
                type="date"
                name="claim_date"
                value={formData.claim_date}
                onChange={handleChange}
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Receipt Number (Optional)
              </label>
              <input
                type="text"
                name="receipt_number"
                value={formData.receipt_number}
                onChange={handleChange}
                className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="Receipt #"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
              placeholder="Provide detailed description of your claim..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Receipt (Optional)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceiptFile(e.target.files[0])}
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: JPG, PNG, PDF (Max 5MB)
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Important Reminders:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Keep your original receipts for verification</li>
          <li>• Submit claims within 30 days of transaction</li>
          <li>• Ensure all details are accurate and complete</li>
          <li>• Processing time is 3-5 business days</li>
        </ul>
      </div>
    </div>
  );
};

export default ClaimsSubmission;
