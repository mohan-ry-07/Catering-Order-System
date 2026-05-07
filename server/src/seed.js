import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const dishes = [
  {
    name: "Paneer Butter Masala",
    category: "North",
    price: 240,
    info: "Creamy tomato gravy with soft paneer cubes, finished with butter and kasuri methi.",
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Chole Bhature",
    category: "North",
    price: 180,
    info: "Spiced chickpea curry served with fluffy fried bhature and pickled onions.",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Masala Dosa",
    category: "South",
    price: 150,
    info: "Crisp rice-lentil crepe filled with potato masala, served with sambar and chutneys.",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Hyderabadi Veg Biryani",
    category: "South",
    price: 220,
    info: "Fragrant basmati rice layered with vegetables, saffron, mint, and biryani spices.",
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Litti Chokha",
    category: "East",
    price: 160,
    info: "Roasted gram flour stuffed litti paired with smoky mashed brinjal and potato chokha.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Bengali Veg Thali",
    category: "East",
    price: 260,
    info: "Rice, dal, shukto, aloo posto, seasonal sabzi, chutney, and a sweet finish.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Pav Bhaji",
    category: "West",
    price: 140,
    info: "Mumbai-style buttered pav served with slow-cooked vegetable bhaji and lemon.",
    imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Gujarati Dhokla Platter",
    category: "West",
    price: 130,
    info: "Soft steamed dhokla with green chutney, fried chilies, and mustard tempering.",
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80"
  }
];

await connectDB();
await Product.deleteMany({});
await Product.insertMany(dishes);
console.log(`Seeded ${dishes.length} Indian dishes`);
process.exit(0);
