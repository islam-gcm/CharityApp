const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const { isAuthenticated, isAuthorized } = require("../middlewares/authMiddleware");
const { normalizeEmail, validateEmail } = require("../middlewares/emailMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiterMiddleware");

router.use(apiLimiter);

// njibo kml donations (GET)
router.get("/", donationController.getDonations);   //public
router.get("/my", isAuthenticated, isAuthorized(["donor"]), donationController.getMyDonations);
router.get("/:id", donationController.getDonationById);
router.get(
  "/:id/claims",
  isAuthenticated,
  isAuthorized(["donor"]),
  donationController.getDonationClaims
);

// donor ycryi donation (POST)
router.post(
  "/",
  isAuthenticated,
  isAuthorized(["donor"]),
  normalizeEmail,
  validateEmail,
  donationController.createDonation
);

router.put(
  "/:id",
  isAuthenticated,
  isAuthorized(["donor"]),
  normalizeEmail,
  validateEmail,
  donationController.updateDonation
);

router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized(["donor"]),
  donationController.deleteDonation
);

module.exports = router;
