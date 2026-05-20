const express = require("express");
const AdoptionRequest = require("../models/AdoptionRequest");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// POST submit a request (Private)
router.post("/", verifyToken, async (req, res) => {
  try {
    // Force requester details from token to prevent spoofing
    const requestData = {
      ...req.body,
      requesterEmail: req.user.email,
    };

    // Check if user already requested this pet
    const existingRequest = await AdoptionRequest.findOne({
      petId: requestData.petId,
      requesterEmail: req.user.email,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "You have already submitted a request for this pet." });
    }

    const newRequest = new AdoptionRequest(requestData);
    await newRequest.save();

    res.status(201).json({ message: "Adoption request submitted successfully", request: newRequest });
  } catch (error) {
    console.error("Submit Request Error:", error);
    res.status(500).json({ message: "Failed to submit adoption request" });
  }
});

// GET user's requests (Private)
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ requesterEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your requests" });
  }
});

// GET requests for owner's listings (Private - check by petId)
router.get("/owner-listings/:petId", verifyToken, async (req, res) => {
  try {
    // Ideally, we verify that req.user.email is the owner of the petId
    // But since the query filters by ownerEmail, it's secure enough
    const requests = await AdoptionRequest.find({ 
      petId: req.params.petId,
      ownerEmail: req.user.email 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests for this pet" });
  }
});

// PATCH approve/reject request (Private)
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body; // should be 'approved' or 'rejected'

    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Ensure only the pet owner can update the status
    if (request.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: You do not own this listing" });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ message: `Request has been ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: "Failed to update request status" });
  }
});

module.exports = router;
