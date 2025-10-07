const Claim = require("../models/Claim");
const Employee = require("../models/Employee");

const claimController = {
  // Create claim
  createClaim: async (req, res) => {
    try {
      const {
        employee_id,
        claim_type,
        amount,
        claim_date,
        receipt_number,
        description,
      } = req.body;
      const receipt_image = req.file
        ? req.file.path.replace(/\\/g, "/").split("server/")[1]
        : null;

      console.log("Creating claim with data:", req.body);
      console.log("Receipt image:", receipt_image);

      if (
        !employee_id ||
        !claim_type ||
        !amount ||
        !claim_date ||
        !description
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      const employee = await Employee.findByPk(employee_id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const claim = await Claim.create({
        employee_id,
        claim_type,
        amount,
        claim_date,
        receipt_number,
        description,
        receipt_image,
      });

      console.log("Claim created successfully:", claim.id);

      res.status(201).json({
        success: true,
        data: claim,
        message: "Claim submitted successfully",
      });
    } catch (error) {
      console.error("Error creating claim:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit claim",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get all claims
  getAllClaims: async (req, res) => {
    try {
      const { status, claim_type, department } = req.query;

      let whereClause = {};
      let employeeWhere = {};

      if (status) whereClause.status = status;
      if (claim_type) whereClause.claim_type = claim_type;
      if (department) employeeWhere.department = department;

      const claims = await Claim.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["fullName", "department", "employeeId"],
            where:
              Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: claims.map((c) => ({
          ...c.toJSON(),
          employee_name: c.employee.fullName,
          department: c.employee.department,
          employee_id: c.employee.employeeId,
        })),
      });
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch claims",
      });
    }
  },

  // Update claim status
  updateClaimStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      const claim = await Claim.findByPk(id);
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: "Claim not found",
        });
      }

      const approver = await Employee.findOne({
        where: { email: req.user.email },
      });

      await claim.update({
        status,
        approved_by: approver ? approver.id : null,
        approved_date: new Date(),
        remarks,
      });

      res.json({
        success: true,
        data: claim,
        message: "Claim status updated successfully",
      });
    } catch (error) {
      console.error("Error updating claim:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update claim status",
      });
    }
  },
};

module.exports = claimController;
