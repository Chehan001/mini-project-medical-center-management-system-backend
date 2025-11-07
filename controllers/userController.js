const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// valid university email domains
const validDomains = ["@std.geo.sab.ac.lk", "@std.appsc.sab.ac.lk"];

// Register new user
const register = async (req, res) => {
  try {
    let { university_mail, university_reg_number, password } = req.body;

    if (!university_mail || !university_reg_number || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Normalize email and ID
    university_mail = university_mail.toLowerCase();
    university_reg_number = university_reg_number.toUpperCase();

    // Validate email domain
    const isValidDomain = validDomains.some((domain) =>
      university_mail.endsWith(domain)
    );
    if (!isValidDomain) {
      return res
        .status(400)
        .json({ message: "This is not a valid University email" });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { university_mail },
        { university_reg_number },
      ],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or ID already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      university_mail,
      university_reg_number,
      password: hashedPassword,
      role: "student", // Set role to 'student'
    });

    const savedUser = await newUser.save();

    // Hide password in response
    const { password: _, ...userData } = savedUser.toObject();

    res
      .status(201)
      .json({ message: "User registered successfully", user: userData });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    let { university_reg_number, password } = req.body;

    if (!university_reg_number || !password) {
      return res.status(400).json({ message: "ID number and password are required" });
    }

    // Normalize ID for consistent lookup
    university_reg_number = university_reg_number.toUpperCase();

    const user = await User.findOne({ university_reg_number });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" }
    );

    const { password: _, ...userData } = user.toObject();

    res.status(200).json({ message: "Login successful", user: userData, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch all users
const fetch = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user by ID
const update = async (req, res) => {
  try {
    const userId = req.params.id;

    // Normalize email/ID if updating
    if (req.body.university_mail) req.body.university_mail = req.body.university_mail.toLowerCase();
    if (req.body.university_reg_number) req.body.university_reg_number = req.body.university_reg_number.toUpperCase();

    // Hash password if present
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  fetch,
  update,
};
