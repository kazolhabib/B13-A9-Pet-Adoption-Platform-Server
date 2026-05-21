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
    description: "Buddy is a very friendly and active Golden Retriever. He loves playing fetch and gets along well with kids and other animals.",
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
    adoptionFee: 5000,
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
    imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Fully Vaccinated",
    location: "Sylhet, Bangladesh",
    adoptionFee: 0,
    description: "Max is a loyal and protective German Shepherd. He is well-trained and obeys basic commands perfectly.",
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
    adoptionFee: 2000,
    description: "Bella is a cute and energetic rabbit. She loves hopping around the garden and eating fresh carrots.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Coco",
    species: "Dog",
    breed: "Labrador Retriever",
    age: "1.5 years",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Fully Vaccinated",
    location: "Dhaka, Bangladesh",
    adoptionFee: 0,
    description: "Coco is a playful and gentle Labrador who adores children. She is house-trained and loves swimming.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Milo",
    species: "Cat",
    breed: "British Shorthair",
    age: "2 years",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Vaccinated",
    location: "Khulna, Bangladesh",
    adoptionFee: 4000,
    description: "Milo is a charming British Shorthair with a calm temperament. He enjoys quiet spaces and gentle cuddles.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Rio",
    species: "Bird",
    breed: "Budgerigar",
    age: "8 months",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Not Required",
    location: "Comilla, Bangladesh",
    adoptionFee: 1500,
    description: "Rio is a vibrant and cheerful Budgerigar. He can mimic sounds and loves to sing throughout the day.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Shadow",
    species: "Dog",
    breed: "Siberian Husky",
    age: "4 years",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Fully Vaccinated",
    location: "Rangpur, Bangladesh",
    adoptionFee: 0,
    description: "Shadow is a majestic Siberian Husky with striking blue eyes. He loves running outdoors and is very energetic.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Daisy",
    species: "Cat",
    breed: "Ragdoll",
    age: "9 months",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Vaccinated",
    location: "Barisal, Bangladesh",
    adoptionFee: 6000,
    description: "Daisy is an adorable Ragdoll kitten with beautiful blue eyes. She loves being held and follows you everywhere.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  },
  {
    name: "Nibbles",
    species: "Rabbit",
    breed: "Mini Rex",
    age: "4 months",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1518796745738-41048802f99a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    healthStatus: "Healthy",
    vaccinationStatus: "Not Vaccinated",
    location: "Mymensingh, Bangladesh",
    adoptionFee: 1000,
    description: "Nibbles is a tiny and curious Mini Rex rabbit with the softest fur. He loves exploring and is very social.",
    ownerEmail: "admin@pethaven.com",
    status: "available",
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing pets and re-seed with full data
    await Pet.deleteMany({});
    console.log("Cleared old pets...");

    await Pet.insertMany(samplePets);
    console.log(`Successfully seeded ${samplePets.length} pets!`);
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
