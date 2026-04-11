const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { emailRegex } = require("../middlewares/emailMiddleware");
const { isAuthenticated, isAuthorized } = require("../middlewares/authMiddleware");

const allowedRoles = ["donor", "charity"];

const sanitizeUser = (user) => {  //*n7wlo document li njiboh mn mongo l object
  const cleanUser = user.toObject ? user.toObject() : user;
  delete cleanUser.password;  //*important n7iw password bch mytb3tch kml l front mm ykon hashed
  return cleanUser; 
}; 

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, organization, registrationNumber } = req.body;

    if (!name || !email || !password) { //* nchofo hd l field isa kynin 9bl ma tl79 asln l db
      return res.status(400).json({ message: "Name, email, and password are required" });  //*
    }

    if (!emailRegex.test(email)) { //* make sure bli email raho form email
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    if (password.length < 8) { //*validation l password
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const safeRole = allowedRoles.includes(role) ? role : "donor"; //* ida kyn role use it ida mkach dir donor by default

    if (safeRole === "charity" && (!organization || !registrationNumber)) {  //* charity validation
      return res.status(400).json({
        message: "Organization and registration number are required for charities"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });  //* registered my9drch y3wd, 409 m3ntha conflict
    }

    const hashedPassword = await bcrypt.hash(password, 12); //drna 12 psk f pdf mktoba 12 rounds w dakhla f range t3 10-12 donc bien

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: safeRole,
      organization,
      registrationNumber
    });

    res.status(201).json(sanitizeUser(user)); // 201 m3ntha created rahi f range t3 200 t3 succesful
  } catch (err) {
    res.status(500).json({ message: err.message }); //500 donc server error
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const user = await User.findOne({ email }); //njibo lmail m db

    if (!user) return res.status(404).json({ message: "User not found" }); //404 error t3 not found m3ntha user not registered

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Wrong password" }); //400 error t3 bad request

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }   //7 days kima la duree f pdf
    );

    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message }); //500 donc server error
  }
};

//ME
const me = async (req, res) => {
  res.json(req.user);
};

//update:
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "organization", "registrationNumber"]; //*apart hdo my9droch ybdlo wkhdokhrin
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid profile fields provided" }); //*mdrna 7ta change 
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, me, updateProfile, isAuthenticated, isAuthorized };
