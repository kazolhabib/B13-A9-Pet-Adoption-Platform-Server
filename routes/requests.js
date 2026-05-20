const express = require("express");
const AdoptionRequest = require("../models/AdoptionRequest");
const Pet = require("../models/Pet");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// POST submit a request
router.post("/", verifyToken, async (req, res) => {
  try {
    const { petId, petName, ownerEmail, phone, address, notes, pickupDate, message } = req.body;

    if (!petId) {
      return res.status(400).json({ success: false, message: "Pet ID is required." });
    }

    // Check if the pet exists and is still available
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found." });
    }
    if (pet.status === "adopted") {
      return res.status(409).json({ success: false, message: "This pet has already been adopted." });
    }

    // Prevent owner from adopting own pet
    if (pet.ownerEmail === req.user.email) {
      return res.status(403).json({ success: false, message: "You cannot submit an adoption request for your own pet." });
    }

    // Check if user already requested this pet
    const existingRequest = await AdoptionRequest.findOne({
      petId,
      requesterEmail: req.user.email,
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: "You have already submitted a request for this pet." });
    }

    const requestData = {
      petId,
      petName: petName || pet.name,
      requesterName: req.body.requesterName || req.user.email.split('@')[0],
      requesterEmail: req.user.email,
      ownerEmail: pet.ownerEmail,
      pickupDate: pickupDate || "",
      message: message || notes || "",
      phone: phone || "",
      address: address || "",
      notes: notes || "",
    };

    const newRequest = new AdoptionRequest(requestData);
    await newRequest.save();

    res.status(201).json({ success: true, message: "Adoption request submitted successfully", data: newRequest });
  } catch (error) {
    console.error("Submit Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit adoption request" });
  }
});

// GET user's own requests
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ requesterEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch your requests" });
  }
});

// GET all requests received by current user (pet owner) (Private)
router.get("/received", verifyToken, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch received requests" });
  }
});

// GET requests for a specific pet by owner (Private)
router.get("/owner-listings/:petId", verifyToken, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ 
      petId: req.params.petId,
      ownerEmail: req.user.email 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch requests for this pet" });
  }
});

// PATCH approve a request (Private) — auto-rejects others + marks pet adopted
router.patch("/:id/approve", verifyToken, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (request.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You do not own this listing" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "This request has already been processed." });
    }

    // 1. Approve this request
    request.status = "approved";
    await request.save();

    // 2. Auto-reject all other pending requests for this pet
    await AdoptionRequest.updateMany(
      { petId: request.petId, _id: { $ne: request._id }, status: "pending" },
      { $set: { status: "rejected" } }
    );

    // 3. Mark the pet as adopted
    await Pet.findByIdAndUpdate(request.petId, { $set: { status: "adopted" } });

    res.status(200).json({ success: true, message: "Request approved! Pet is now marked as adopted." });
  } catch (error) {
    console.error("Approve Error:", error);
    res.status(500).json({ success: false, message: "Failed to approve request" });
  }
});

// PATCH reject a request (Private)
router.patch("/:id/reject", verifyToken, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (request.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You do not own this listing" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "This request has already been processed." });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ success: true, message: "Request has been rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reject request" });
  }
});

// Legacy PATCH with status in body (backward compat)
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
    }

    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (request.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You do not own this listing" });
    }

    request.status = status;
    await request.save();

    if (status === "approved") {
      await AdoptionRequest.updateMany(
        { petId: request.petId, _id: { $ne: request._id }, status: "pending" },
        { $set: { status: "rejected" } }
      );
      await Pet.findByIdAndUpdate(request.petId, { $set: { status: "adopted" } });
    }

    res.status(200).json({ success: true, message: `Request has been ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update request status" });
  }
});

// DELETE a request (Cancel Request)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    // Ensure only the requester can delete their request
    if (request.requesterEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not own this request" });
    }

    await AdoptionRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Adoption request cancelled successfully." });
  } catch (error) {
    console.error("Delete Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel request" });
  }
});

module.exports = router;
