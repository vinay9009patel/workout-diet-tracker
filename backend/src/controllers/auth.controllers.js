import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.models.js";

const isStrongPassword = (password) => {
  // Minimum 8 chars with upper/lower/number/symbol.
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    password
  );
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with upper/lower/number/symbol",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      gender: ["male", "female"].includes(String(gender || "").toLowerCase())
        ? String(gender).toLowerCase()
        : "",
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  return res.json(req.user);
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: `/uploads/${req.file.filename}` },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({
      message: "Avatar updated",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const incomingGender = String(req.body?.gender || "").toLowerCase();
    const gender = ["male", "female", ""].includes(incomingGender) ? incomingGender : "";

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { gender },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
