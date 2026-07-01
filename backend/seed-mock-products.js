// backend/seed-mock-products.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const Product = require('./models/Product');
const Category = require('./models/Category');

// Database Connection URI
const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/it-marketplace';

async function seedDatabase() {
  console.log('⚡ Starting database seeding process...');
  
  try {
    // 1. Establish MongoDB Connection
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully.');

    // 2. Clear Existing Products to prevent duplicate key errors (SKU / Slug)
    console.log('🧹 Cleaning old product records...');
    await Product.deleteMany({});
    
    // 3. Ensure Categories exist in database
    const categoryNames = ["Wallets", "Fragrances", "Jewellery", "Watches"];
    const categoryMap = {};

    console.log('📁 Checking category configurations...');
    for (const name of categoryNames) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({
          name,
          description: `Premium collection of luxury ${name.toLowerCase()}`,
          slug: name.toLowerCase(),
          isActive: true
        });
        console.log(`🆕 Created missing category: "${name}"`);
      } else {
        console.log(`✔ Category already exists: "${name}"`);
      }
      categoryMap[name] = cat._id;
    }

    // 4. Create Mock Products
    const mockProducts = [
      {
        title: "Handmade Full-Grain Leather Wallet",
        description: "Exquisite handmade bifold wallet crafted from full-grain vegetable-tanned leather. Features space for up to 8 cards, a dedicated currency bill compartment, and RFID protection.",
        price: 3499,
        originalPrice: 4999,
        discount: 30,
        stock: 45,
        sku: "IT-WLT-001",
        category: [categoryMap["Wallets"]],
        brand: "Tijarat Heritage",
        isActive: true,
        isVisible: true,
        isFeatured: true,
        image: "placeholder-image.jpg"
      },
      {
        title: "Victorious Eau De Parfum For Men",
        description: "A bold, sophisticated fragrance opening with fresh citrus notes of bergamot and a warm, woody base of amberwood, musk, and patchouli. Long-lasting luxury scent for the modern man.",
        price: 8999,
        originalPrice: 12000,
        discount: 25,
        stock: 30,
        sku: "IT-FRG-002",
        category: [categoryMap["Fragrances"]],
        brand: "Victorious Perfumes",
        isActive: true,
        isVisible: true,
        isFeatured: true,
        image: "placeholder-image.jpg"
      },
      {
        title: "Handcrafted 22K Gold Bangles Set",
        description: "A beautifully detailed, handcrafted set of 4 classic bangles layered in 22K gold plating. Features intricate traditional filigree engravings suitable for premium wedding collections.",
        price: 18500,
        originalPrice: 18500,
        discount: 0,
        stock: 15,
        sku: "IT-JWL-003",
        category: [categoryMap["Jewellery"]],
        brand: "Grand Jewels",
        isActive: true,
        isVisible: true,
        isFeatured: true,
        image: "placeholder-image.jpg"
      },
      {
        title: "Ocean Blue Chronograph Luxury Watch",
        description: "A luxury mechanical watch featuring an ocean blue dial, scratch-resistant sapphire crystal glass, a premium stainless steel bracelet, and 100-meter water resistance.",
        price: 24500,
        originalPrice: 32000,
        discount: 23,
        stock: 20,
        sku: "IT-WTC-004",
        category: [categoryMap["Watches"]],
        brand: "Tijarat Premium",
        isActive: true,
        isVisible: true,
        isFeatured: true,
        image: "placeholder-image.jpg"
      }
    ];

    console.log('🚀 Seeding premium mock products...');
    const inserted = await Product.insertMany(mockProducts);
    console.log(`🎉 Successfully seeded ${inserted.length} premium products in the database!`);

  } catch (error) {
    console.error('❌ Seeding process failed:', error);
  } finally {
    // 5. Disconnect cleanly
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedDatabase();