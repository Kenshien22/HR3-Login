import React from "react";

const ClaimDetailModal = ({ claim, onClose }) => {
  if (!claim) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Claim Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Claim ID: CLM-00{claim.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Employee Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Name:
                </span>
                <p className="font-medium">{claim.employee_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Employee ID:
                </span>
                <p className="font-medium">{claim.employee_id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Department:
                </span>
                <p className="font-medium">{claim.department}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Position:
                </span>
                <p className="font-medium">{claim.position || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Claim Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Claim Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Type:
                </span>
                <p className="font-medium">{claim.claim_type}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Amount:
                </span>
                <p className="font-medium text-lg text-green-600">
                  ₱{claim.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Claim Date:
                </span>
                <p className="font-medium">{claim.claim_date}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Receipt Number:
                </span>
                <p className="font-medium">{claim.receipt_number || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <p className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      claim.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : claim.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {claim.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                {claim.description}
              </p>
            </div>
          </div>

          {/* Receipt Image */}
          {claim.receipt_image && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Receipt Image</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <img
                  src={`http://localhost:3000/${claim.receipt_image.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt="Receipt"
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">No Image</text></svg>';
                  }}
                />
                <a
                  href={`http://localhost:3000/${claim.receipt_image.replace(
                    /\\/g,
                    "/"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-blue-500 hover:text-blue-700 text-sm"
                >
                  Open image in new tab
                </a>
              </div>
            </div>
          )}

          {/* Remarks */}
          {claim.remarks && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Remarks</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {claim.remarks}
                </p>
              </div>
            </div>
          )}

          {/* Approval Info */}
          {claim.approved_date && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Approval Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Approved on: {new Date(claim.approved_date).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailModal;
