const Donation = require("../models/Donation");
const Transaction = require("../models/Transaction");

const allowedDonationTypes = Donation.allowedDonationTypes;
const allowedUpdateFields = ["name", "donationType", "quantity", "description", "contactPhone", "contactEmail"];

const validateDonationInput = (body, isUpdate = false) => {
  const { name, donationType, quantity, contactEmail } = body;

  if (!isUpdate && (!name || !donationType || quantity === undefined)) {
    return "Donation name, type, and quantity are required";
  }

  if (name !== undefined && String(name).trim().length === 0) {
    return "Donation name is required";
  }

  if (donationType && !allowedDonationTypes.includes(donationType)) {
    return "Invalid donation type";
  }

  if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 1)) {
    return "Quantity must be a number greater than or equal to 1";
  }

  if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return "Please enter a valid contact email";
  }

  return null;
};

// CREATE DONATION
const createDonation = async (req, res) => {
  try {
    const validationError = validateDonationInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const quantity = Number(req.body.quantity);

    const donation = await Donation.create({
      donor: req.user.id,
      ...req.body,
      quantity,
      remainingQty: quantity
    });

    res.status(201).json(donation); // 201 m3ntha created
  } catch (err) {
    res.status(500).json({ message: err.message }); //500 donc server error
  }
};

// njibo kml AVAILABE DONATIOBS (GET)
const getDonations = async (req, res) => {
  try {
    const { type, search, sort = "newest" } = req.query;
    const filter= { status: "available" };
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "a-z": { name: 1 },
      "z-a": { name: -1 },
      quantity: { remainingQty: -1 }
    };

    if(type){
      filter.donationType = type; //filter b type
    }

    if(search){
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]; //i bch mtwlich case sensitive, regexhya term
    }

    const query = Donation.find(filter)
      .populate("donor", "name email")
      .sort(sortOptions[sort] || sortOptions.newest); //hna bch tkon by default newest first

    if (sort === "a-z" || sort === "z-a") {
      query.collation({ locale: "en", strength: 2 });
    }

    const donations = await query;

    res.json(donations); //reponse tkon de type json
  } catch (err) {
    res.status(500).json({ message: err.message }); //500 donc server error
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate("donor", "name email phone");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update donation:
const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    // ncheckiw ida kynha donation
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // ownership check (security)
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // prevent editing after claims started (important business rule)
    if (donation.remainingQty !== donation.quantity) {
      return res.status(400).json({
        message: "Cannot edit donation after it has been partially claimed"
      });
    }

    const validationError = validateDonationInput(req.body, true);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updates = {};
    allowedUpdateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === "quantity" ? Number(req.body[field]) : req.body[field];
      }
    });

    if (updates.quantity !== undefined) {
      updates.remainingQty = updates.quantity;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid donation fields provided" });
    }

    // update allowed fields only
    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: "after", runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (donation.remainingQty !== donation.quantity) {
      return res.status(400).json({ message: "Cannot delete donation after claims started" });
    }

    await donation.deleteOne();

    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDonationClaims = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const claims = await Transaction.find({ donation: req.params.id })
      .populate("charity", "name email organization")
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  updateDonation,
  deleteDonation,
  getDonationClaims
};
