const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT and set cookie
function generateTokenAndCookie(user, res) {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl || "",
  };
}

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, photoUrl } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photoUrl: photoUrl || "",
      provider: "local",
    });

    await newUser.save();
    const token = generateTokenAndCookie(newUser, res);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    if (user.provider === "google") {
      return res.status(400).json({ success: false, message: "This account uses Google Sign-In. Please use the Google button." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateTokenAndCookie(user, res);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// Google OAuth Login Route
router.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential is required" });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || "Google User",
        email,
        photoUrl: picture || "",
        provider: "google",
        password: "",
      });
      await user.save();
    } else if (user.provider === "local") {
      // If user registered with email/password but now signing in with Google,
      // update their photo if they don't have one
      if (!user.photoUrl && picture) {
        user.photoUrl = picture;
        await user.save();
      }
    }

    const token = generateTokenAndCookie(user, res);

    res.status(200).json({
      success: true,
      message: "Google sign-in successful",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ success: false, message: "Google authentication failed. Invalid token." });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Get Current User
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching user profile" });
  }
});

module.exports = router;
