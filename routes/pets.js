const express = require("express");
const Pet = require("../models/Pet");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// GET all available pet (Public) - with Advanced Filtering & Searching
router.get("/", async (req, res) => {
  try {
    const { search, species, sort } = req.query;

    // Build query
    let query = { status: "available" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } }
      ];
    }

    if (species && species !== "All") {
      const speciesArray = species.split(",");
      query.species = { $in: speciesArray };
    }

    let sortOptions = {};
    if (sort === "newest") sortOptions.createdAt = -1;
    else if (sort === "oldest") sortOptions.createdAt = 1;
    else if (sort === "name-asc") sortOptions.name = 1;
    else if (sort === "name-desc") sortOptions.name = -1;
    else sortOptions.createdAt = -1;

    const pets = await Pet.find(query).sort(sortOptions).lean();
    // Add `image` alias so client can use either field name
    const petsWithAlias = pets.map(pet => ({ ...pet, image: pet.imageUrl || pet.image }));
    res.status(200).json({ success: true, data: petsWithAlias });
  } catch (error) {
    console.error("Fetch Pets Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pets" });
  }
});

// GET current user's own listings (Private)
router.get("/my-listings", verifyToken, async (req, res) => {
  try {
    const listings = await Pet.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 }).lean();
    const listingsWithAlias = listings.map(pet => ({ ...pet, image: pet.imageUrl || pet.image }));
    res.status(200).json({ success: true, data: listingsWithAlias });
  } catch (error) {
    console.error("Fetch My Listings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your listings" });
  }
});

// GET single pet details (Public)
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).lean();
    if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });
    // Add image alias
    pet.image = pet.imageUrl || pet.image;
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch pet details" });
  }
});

// POST add a new pet (Private)
router.post("/", verifyToken, async (req, res) => {
  try {
    const petData = {
      ...req.body,
      ownerEmail: req.user.email,
      // Support both field names from client
      imageUrl: req.body.imageUrl || req.body.image,
    };
    const newPet = new Pet(petData);
    await newPet.save();
    const petObj = newPet.toObject();
    petObj.image = petObj.imageUrl;
    res.status(201).json({ success: true, message: "Pet listed successfully", data: petObj });
  } catch (error) {
    console.error("Add Pet Error:", error);
    res.status(500).json({ success: false, message: "Failed to add pet" });
  }
});

// PUT update a pet (Private)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

    if (pet.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You don't own this listing" });
    }

    // Support both field names
    if (req.body.image && !req.body.imageUrl) {
      req.body.imageUrl = req.body.image;
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    updatedPet.image = updatedPet.imageUrl;
    
    res.status(200).json({ success: true, message: "Pet updated successfully", data: updatedPet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update pet" });
  }
});

// DELETE a pet (Private)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

    if (pet.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You don't own this listing" });
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete pet" });
  }
});

module.exports = router;
