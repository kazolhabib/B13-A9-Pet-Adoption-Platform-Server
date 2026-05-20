require("dotenv").config();
const mongoose = require("mongoose");
const Pet = require("./models/Pet");

const samplePets = [
  {
    name: "Buddy",
    species: "Dog",
    breed: "Golden Retriever",
    age: "2 years",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Fully Vaccinated",
    location: "Dhaka, Bangladesh",
    adoptionFee: 0,
    description: "Buddy is a very friendly and active Golden Retriever. He loves playing fetch and gets along well with kids.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Whiskers",
    species: "Cat",
    breed: "Persian",
    age: "1 year",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Vaccinated",
    location: "Chittagong, Bangladesh",
    adoptionFee: 50,
    description: "Whiskers is a calm and affectionate Persian cat. She enjoys lounging by the window and being petted.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Max",
    species: "Dog",
    breed: "German Shepherd",
    age: "3 years",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Fully Vaccinated",
    location: "Sylhet, Bangladesh",
    adoptionFee: 0,
    description: "Max is a loyal and protective German Shepherd. He is well-trained and obeys basic commands.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Bella",
    species: "Rabbit",
    breed: "Holland Lop",
    age: "6 months",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Not Vaccinated",
    location: "Rajshahi, Bangladesh",
    adoptionFee: 20,
    description: "Bella is a cute and energetic rabbit. She loves hopping around the garden and eating fresh carrots.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    const count = await Pet.countDocuments();
    if (count === 0) {
      console.log("No pets found. Seeding sample pets...");
      await Pet.insertMany(samplePets);
      console.log("Sample pets added successfully!");
    } else {
      console.log(`Database already has ${count} pets. Skipping seed.`);
    }
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
