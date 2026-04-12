const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");

const { isAuthenticated, isAuthorized } = require("../middlewares/authMiddleware");
const charityCheck = require("../middlewares/charityCheckMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiterMiddleware");

router.use(apiLimiter);

// claim hna ykon ghir ll aproved charities
router.post(
  "/",
  isAuthenticated,
  isAuthorized(["charity"]),
  charityCheck,
  transactionController.claimDonation
);

router.post(
  "/claim",
  isAuthenticated,
  isAuthorized(["charity"]),
  charityCheck,
  transactionController.claimDonation
);

router.get(
  "/",
  isAuthenticated,
  isAuthorized(["admin"]),
  transactionController.getAllClaims
);

router.get(
  "/my",
  isAuthenticated,
  isAuthorized(["charity"]),
  transactionController.getMyClaims
);

router.get("/:id", isAuthenticated, transactionController.getClaimById);

router.put(
  "/:id/status",
  isAuthenticated,
  isAuthorized(["admin"]),
  transactionController.updateClaimStatus
);

module.exports = router;
