const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const verifyUser = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(verifyUser);

router.post(
  "/claims",
  upload.single("receipt_image"),
  claimController.createClaim
);
router.get("/claims", claimController.getAllClaims);
router.put("/claims/:id/status", claimController.updateClaimStatus);

module.exports = router;
