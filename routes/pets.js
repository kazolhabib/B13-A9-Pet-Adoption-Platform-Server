const express = require("express");
const Pet = require("../models/Pet");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// GET all pets (Public) - with Advanced Filtering & Searching
// GET all pets (Public) - with Advanced Filtering & Searching
router.get("/", async (req, res) => {
  console.log("run");

  try {
    const { search, species, sort } = req.query;

    // Build query
    let query = { status: "available" }; // Default to available pets

    // Regex Search by Name or Breed
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by Species using $in
    if (species && species !== "All") {
      const speciesArray = species.split(",");
      query.species = { $in: speciesArray };
    }

    // Build sort options
    let sortOptions = {};
    if (sort === "newest") sortOptions.createdAt = -1;
    if (sort === "oldest") sortOptions.createdAt = 1;
    if (sort === "name-asc") sortOptions.name = 1;
    if (sort === "name-desc") sortOptions.name = -1;

    if (Object.keys(sortOptions).length === 0) {
      sortOptions.createdAt = -1;
    }

    // Single query execution (fixed: only one `pets` declaration)
    const pets = await Pet.find(query).sort(sortOptions);
    res.status(200).json(pets);
  } catch (error) {
    console.error("Fetch Pets Error:", error);
    res.status(500).json({ message: "Failed to fetch pets" });
  }
});

// GET single pet details (Public)
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pet details" });
  }
});

// POST add a new pet (Private)
router.post("/", verifyToken, async (req, res) => {
  try {
    // Force owner email to be the logged in user's email for security
    const petData = { ...req.body, ownerEmail: req.user.email };
    const newPet = new Pet(petData);
    await newPet.save();
    res.status(201).json({ message: "Pet listed successfully", pet: newPet });
  } catch (error) {
    console.error("Add Pet Error:", error);
    res.status(500).json({ message: "Failed to add pet" });
  }
});

// PUT update a pet (Private)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Ensure only the owner or an admin can update
    if (pet.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: You don't own this listing" });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ message: "Pet updated successfully", pet: updatedPet });
  } catch (error) {
    res.status(500).json({ message: "Failed to update pet" });
  }
});

// DELETE a pet (Private)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Ensure only the owner or an admin can delete
    if (pet.ownerEmail !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: You don't own this listing" });
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete pet" });
  }
});

module.exports = router;
