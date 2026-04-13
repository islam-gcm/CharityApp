const emailRegex = /^\S+@\S+\.\S+$/; //* form t3 mail kch ykon

const normalizeEmail = async (req, res, next) => {
  if (req.body?.email && typeof req.body.email === "string") {
    req.body.email = req.body.email.trim().toLowerCase(); // nsgmo l form t3 mail t3na hna tan (azzedine notes)
  }

  if (req.body?.contactEmail && typeof req.body.contactEmail === "string") {
    req.body.contactEmail = req.body.contactEmail.trim().toLowerCase();
  }

  next();
};

const validateEmail = async (req, res, next) => {
  const { email, contactEmail } = req.body || {};

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }

  if (contactEmail && !emailRegex.test(contactEmail)) {
    return res.status(400).json({ message: "Please enter a valid contact email" });
  }

  next();
};

module.exports = { normalizeEmail, validateEmail, emailRegex };
