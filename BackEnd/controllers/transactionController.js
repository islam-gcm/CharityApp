const Donation = require("../models/Donation");
const Transaction = require("../models/Transaction");
const { createNotification } = require("./notificationController");

const validateClaimInput = ({ donationId, quantity }) => {
  if (!donationId) {
    return "Donation id is required";
  }

  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return "Quantity must be a number greater than or equal to 1";
  }

  return null;
};

const claimDonation = async (req, res) => {
  try {
    const { donationId, quantity, notes } = req.body;
    const requestedQuantity = Number(quantity);
    const validationError = validateClaimInput({ donationId, quantity });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    //n7wso 9bl ida donation kynha
    const donation = await Donation.findOneAndUpdate(
      {
        _id: donationId,
        status: "available",
        remainingQty: { $gte: requestedQuantity }
      },
      { $inc: { remainingQty: -requestedQuantity } },
      { returnDocument: "after" }
    );

    if (!donation) {
      const existingDonation = await Donation.findById(donationId);
      if (!existingDonation) {
        return res.status(404).json({ message: "Donation not found" });
      }

      await createNotification(
        req.user.id,
        "donation_failed_insufficient_quantity",
        "Not enough items available in this donation"
      );

      return res.status(400).json({
        message: existingDonation.status !== "available"
          ? "Donation not available"
          : "Not enough quantity available"
      });
    }

    if (donation.remainingQty === 0) {
      donation.status = "completed";
      await donation.save();
    }

    // ncryiw transaction
    const transaction = await Transaction.create({
      donation: donationId,
      charity: req.user.id,
      quantity: requestedQuantity,
      notes: notes || ""
    });

    const charityName = req.user.organization || req.user.name || "A charity";
    const donationName = donation.name || "your donation";
    const remainingMessage = donation.remainingQty === 0
      ? "The donation is now completed."
      : `${donation.remainingQty} units remain.`;

    // notify donor (success)
    await createNotification(
      donation.donor,
      "donation_claimed",
      `${charityName} claimed ${requestedQuantity} units from "${donationName}". ${remainingMessage}`
    );

    // ki tkon claimed bien ndiro response bli jazt
    res.status(201).json({
      message: "Donation claimed successfully",
      transaction
    });

  } catch (err) {
    res.status(500).json({ message: err.message }); //500 donc server error
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Transaction.find({ charity: req.user.id })
      .populate("donation")
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ["pending", "confirmed", "rejected"].includes(status)) {
      filter.status = status;
    }

    const claims = await Transaction.find(filter)
      .populate("donation")
      .populate("charity", "name email organization")
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClaimById = async (req, res) => {
  try {
    const claim = await Transaction.findById(req.params.id)
      .populate("donation")
      .populate("charity", "name email organization");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const donationOwner = claim.donation?.donor?.toString();
    const canView =
      req.user.role === "admin" ||
      claim.charity._id.toString() === req.user.id ||
      donationOwner === req.user.id;

    if (!canView) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid claim status" });
    }

    const claim = await Transaction.findById(req.params.id).populate("donation");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.status === status) {
      return res.json(claim);
    }

    if (claim.status !== "rejected" && status === "rejected") {
      const restoredDonation = await Donation.findByIdAndUpdate(
        claim.donation._id,
        {
          $inc: { remainingQty: claim.quantity },
          status: "available"
        },
        { returnDocument: "after", runValidators: true }
      );

      if (!restoredDonation) {
        return res.status(404).json({ message: "Donation not found" });
      }
    }

    if (claim.status === "rejected" && status !== "rejected") {
      const reservedDonation = await Donation.findOneAndUpdate(
        {
          _id: claim.donation._id,
          status: "available",
          remainingQty: { $gte: claim.quantity }
        },
        { $inc: { remainingQty: -claim.quantity } },
        { returnDocument: "after", runValidators: true }
      );

      if (!reservedDonation) {
        return res.status(400).json({ message: "Not enough quantity available to restore this claim" });
      }

      if (reservedDonation.remainingQty === 0) {
        reservedDonation.status = "completed";
        await reservedDonation.save();
      }
    }

    claim.status = status;
    await claim.save();

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { claimDonation, getMyClaims, getAllClaims, getClaimById, updateClaimStatus };
