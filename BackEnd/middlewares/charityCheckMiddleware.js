const charityCheck = async (req, res, next) => {
  if (req.user.role === "charity" && req.user.status !== "approved") {
    return res.status(403).json({ message: "Charity not verified yet" });
  }

  next();
};

module.exports = charityCheck;
