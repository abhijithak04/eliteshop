const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createTemporaryImage = (name) => {
  return `https://placehold.co/900x900/e5e7eb/111827?text=${encodeURIComponent(
    name
  )}`;
};

const createProduct = ({
  name,
  brand,
  category,
  price,
  originalPrice,
  stock,
  imageQuery,
  index,
}) => {
  const discountPercentage = Math.max(
    0,
    Math.round(((originalPrice - price) / originalPrice) * 100)
  );

  const slug = slugify(`${name}-${index}`);

  const image = createTemporaryImage(name);

  return {
    name,
    slug,
    brand,
    category,
    price,
    originalPrice,
    discountPercentage,
    image,
    images: [image],
    description: `${name} from ${brand} is a premium ${category.toLowerCase()} product with high quality, reliable performance, stylish design and great value for EliteShop customers.`,
    countInStock: stock,
    lowStockThreshold: 5,
    rating: Number((4 + Math.random() * 0.9).toFixed(1)),
    numReviews: Math.floor(20 + Math.random() * 250),
    views: Math.floor(100 + Math.random() * 5000),
    soldCount: Math.floor(5 + Math.random() * 300),
    isFeatured: index % 5 === 0,
    isActive: true,
    freeShipping: index % 3 === 0,
    tags: [
      category.toLowerCase(),
      brand.toLowerCase(),
      "eliteshop",
      "premium",
      imageQuery || name,
    ],
  };
};

const productGroups = {
  Mobiles: [
    ["Apple iPhone 15 Pro Max", "Apple", 149900, 159900, 18, "iphone"],
    ["Samsung Galaxy S24 Ultra", "Samsung", 129999, 139999, 22, "samsung smartphone"],
    ["OnePlus 12 5G", "OnePlus", 64999, 69999, 30, "oneplus phone"],
    ["Google Pixel 8 Pro", "Google", 99999, 109999, 14, "google pixel phone"],
    ["Vivo X100 Pro", "Vivo", 89999, 94999, 20, "vivo smartphone"],
    ["Oppo Reno 11 Pro", "Oppo", 39999, 45999, 35, "oppo phone"],
    ["Realme GT Neo", "Realme", 32999, 37999, 40, "realme phone"],
    ["Redmi Note 13 Pro", "Redmi", 24999, 29999, 55, "redmi phone"],
    ["Motorola Edge 50", "Motorola", 31999, 36999, 25, "motorola smartphone"],
    ["Nothing Phone 2", "Nothing", 44999, 49999, 18, "smartphone"],
    ["iQOO Neo 9 Pro", "iQOO", 37999, 42999, 34, "gaming phone"],
    ["Samsung Galaxy A55", "Samsung", 39999, 44999, 28, "galaxy phone"],
    ["Apple iPhone 14", "Apple", 59999, 69999, 16, "iphone"],
    ["Poco X6 Pro", "Poco", 26999, 31999, 42, "poco phone"],
    ["Lava Agni 2 5G", "Lava", 19999, 24999, 30, "indian smartphone"],
    ["Samsung Galaxy M55", "Samsung", 26999, 32999, 33, "samsung mobile"],
    ["OnePlus Nord CE 4", "OnePlus", 24999, 29999, 38, "oneplus mobile"],
    ["Realme Narzo 70 Pro", "Realme", 19999, 24999, 45, "realme mobile"],
    ["Redmi 13C 5G", "Redmi", 10999, 14999, 60, "redmi mobile"],
    ["Motorola G85 5G", "Motorola", 17999, 21999, 36, "motorola mobile"],
  ],

  Electronics: [
    ["Sony WH-1000XM5 Headphones", "Sony", 29990, 34990, 25, "headphones"],
    ["Boat Stone Bluetooth Speaker", "Boat", 2499, 3999, 70, "bluetooth speaker"],
    ["JBL Flip 6 Speaker", "JBL", 8999, 11999, 45, "jbl speaker"],
    ["Apple AirPods Pro", "Apple", 24900, 26900, 30, "airpods"],
    ["Samsung Galaxy Buds 2 Pro", "Samsung", 14999, 19999, 35, "wireless earbuds"],
    ["Mi Power Bank 20000mAh", "Xiaomi", 2199, 2999, 80, "power bank"],
    ["Logitech Wireless Mouse", "Logitech", 1299, 1999, 90, "wireless mouse"],
    ["HP Mechanical Keyboard", "HP", 3499, 4999, 44, "keyboard"],
    ["Lenovo USB-C Hub", "Lenovo", 2499, 3499, 60, "usb hub"],
    ["Canon Pixma Printer", "Canon", 8999, 11999, 20, "printer"],
    ["TP-Link WiFi Router", "TP-Link", 1999, 2999, 50, "wifi router"],
    ["Sony Portable SSD 1TB", "Sony", 8499, 10999, 25, "portable ssd"],
    ["Sandisk Ultra Pendrive 128GB", "Sandisk", 899, 1299, 100, "pendrive"],
    ["Amazon Echo Dot", "Amazon", 4499, 5499, 40, "smart speaker"],
    ["Philips Smart LED Bulb", "Philips", 799, 1199, 120, "smart bulb"],
    ["Sony Wireless Earbuds", "Sony", 7999, 9999, 45, "wireless earbuds"],
    ["Boat Smart Watch", "Boat", 2499, 3999, 80, "smart watch"],
    ["Logitech Webcam HD", "Logitech", 2999, 4499, 40, "webcam"],
    ["HP USB Keyboard", "HP", 899, 1299, 90, "keyboard"],
    ["Anker Fast Charger", "Anker", 1499, 2499, 70, "phone charger"],
  ],

  Fashion: [
    ["Nike Air Max Running Shoes", "Nike", 8999, 11999, 40, "nike shoes"],
    ["Adidas Ultraboost Shoes", "Adidas", 10999, 14999, 32, "adidas shoes"],
    ["Puma Casual Sneakers", "Puma", 3999, 5999, 50, "sneakers"],
    ["Levi's Slim Fit Jeans", "Levi's", 2499, 3999, 70, "jeans"],
    ["Premium Cotton T-Shirt", "EliteWear", 799, 1299, 120, "tshirt"],
    ["Formal White Shirt", "Van Heusen", 1599, 2499, 60, "formal shirt"],
    ["Men's Leather Wallet", "WildHorn", 999, 1499, 80, "wallet"],
    ["Women Handbag", "Lavie", 2499, 3999, 45, "handbag"],
    ["Sports Track Pants", "HRX", 1299, 1999, 75, "track pants"],
    ["Hooded Sweatshirt", "Roadster", 1499, 2499, 55, "hoodie"],
    ["Analog Wrist Watch", "Fastrack", 1999, 2999, 65, "watch"],
    ["Ray-Ban Sunglasses", "Ray-Ban", 5999, 7999, 28, "sunglasses"],
    ["Ethnic Kurta Set", "Manyavar", 3499, 4999, 30, "kurta"],
    ["Casual Denim Jacket", "Levi's", 3999, 5999, 35, "denim jacket"],
    ["Cotton Saree", "Biba", 1999, 3499, 42, "saree"],
    ["Men Casual Shirt", "Roadster", 999, 1599, 80, "casual shirt"],
    ["Women Western Dress", "Tokyo Talkies", 1299, 2299, 55, "dress"],
    ["Leather Belt", "WildHorn", 699, 999, 90, "belt"],
    ["Sports Cap", "Nike", 899, 1299, 75, "cap"],
    ["Formal Shoes", "Bata", 2499, 3499, 45, "formal shoes"],
  ],

  Home: [
    ["Prestige Non-Stick Cookware Set", "Prestige", 3499, 4999, 35, "cookware"],
    ["Milton Water Bottle", "Milton", 599, 899, 100, "water bottle"],
    ["Cello Dinner Set", "Cello", 2499, 3999, 45, "dinner set"],
    ["Wooden Study Table", "HomeCraft", 7499, 9999, 20, "study table"],
    ["Cotton Bedsheet Set", "Wakefit", 1299, 1999, 80, "bedsheet"],
    ["Kitchen Storage Containers", "Solimo", 999, 1599, 90, "storage containers"],
    ["Wall Clock Premium", "Ajanta", 799, 1299, 70, "wall clock"],
    ["LED Table Lamp", "Philips", 1499, 2499, 48, "table lamp"],
    ["Bathroom Organizer Rack", "HomeCentre", 1199, 1999, 60, "bathroom rack"],
    ["Ceramic Coffee Mug Set", "Clay Craft", 699, 999, 110, "coffee mug"],
    ["Door Mat Anti Slip", "Status", 499, 799, 95, "door mat"],
    ["Curtain Set Premium", "Story Home", 1999, 2999, 35, "curtains"],
    ["Pressure Cooker 5L", "Prestige", 2199, 3299, 40, "pressure cooker"],
    ["Lunch Box Stainless Steel", "Milton", 899, 1299, 75, "lunch box"],
    ["Wall Shelf Decor", "HomeCraft", 1499, 2499, 38, "wall shelf"],
    ["Glass Storage Jar Set", "Borosil", 999, 1499, 65, "storage jar"],
    ["Kitchen Knife Set", "Pigeon", 799, 1199, 55, "knife set"],
    ["Non Stick Tawa", "Prestige", 899, 1299, 70, "tawa"],
    ["Cushion Cover Set", "HomeCentre", 699, 999, 85, "cushion cover"],
    ["Laundry Basket", "Solimo", 599, 899, 75, "laundry basket"],
  ],

  Beauty: [
    ["Lakme Face Cream", "Lakme", 299, 499, 120, "beauty cream"],
    ["Mamaearth Face Wash", "Mamaearth", 249, 399, 140, "face wash"],
    ["Nivea Body Lotion", "Nivea", 399, 599, 100, "body lotion"],
    ["Maybelline Lipstick", "Maybelline", 499, 799, 80, "lipstick"],
    ["L'Oreal Shampoo", "L'Oreal", 599, 899, 90, "shampoo"],
    ["Dove Conditioner", "Dove", 349, 549, 75, "conditioner"],
    ["Himalaya Neem Face Pack", "Himalaya", 199, 349, 110, "face pack"],
    ["Garnier Hair Serum", "Garnier", 449, 699, 70, "hair serum"],
    ["Biotique Sunscreen", "Biotique", 299, 499, 85, "sunscreen"],
    ["Plum Green Tea Toner", "Plum", 390, 590, 65, "toner"],
    ["Minimalist Vitamin C Serum", "Minimalist", 699, 999, 55, "serum"],
    ["Nykaa Nail Polish Set", "Nykaa", 299, 499, 95, "nail polish"],
    ["Philips Hair Dryer", "Philips", 1499, 2199, 42, "hair dryer"],
    ["Vega Makeup Brush Kit", "Vega", 899, 1299, 60, "makeup brush"],
    ["The Man Company Perfume", "The Man Company", 799, 1299, 52, "perfume"],
    ["Cetaphil Cleanser", "Cetaphil", 699, 899, 60, "cleanser"],
    ["WOW Onion Hair Oil", "WOW", 399, 599, 80, "hair oil"],
    ["Ponds Face Moisturizer", "Ponds", 249, 399, 95, "moisturizer"],
    ["Swiss Beauty Kajal", "Swiss Beauty", 199, 299, 110, "kajal"],
    ["Beardo Beard Oil", "Beardo", 349, 599, 70, "beard oil"],
  ],

  Grocery: [
    ["Aashirvaad Atta 5kg", "Aashirvaad", 249, 349, 100, "atta"],
    ["India Gate Basmati Rice 5kg", "India Gate", 599, 799, 80, "basmati rice"],
    ["Fortune Sunflower Oil 1L", "Fortune", 149, 199, 120, "cooking oil"],
    ["Tata Salt 1kg", "Tata", 28, 35, 150, "salt"],
    ["Tata Tea Gold 500g", "Tata", 299, 399, 90, "tea"],
    ["Bru Instant Coffee", "Bru", 199, 299, 70, "coffee"],
    ["Maggi Noodles Pack", "Maggi", 149, 199, 130, "noodles"],
    ["Kissan Mixed Fruit Jam", "Kissan", 189, 249, 85, "jam"],
    ["Britannia Good Day Cookies", "Britannia", 99, 149, 140, "cookies"],
    ["Amul Ghee 1L", "Amul", 599, 699, 60, "ghee"],
    ["Horlicks Health Drink", "Horlicks", 349, 449, 75, "health drink"],
    ["Freshy Watermelon Juice", "Freshy", 149, 199, 48, "watermelon juice"],
    ["Real Mixed Fruit Juice", "Real", 119, 159, 80, "fruit juice"],
    ["MTR Ready To Eat Paneer", "MTR", 199, 299, 65, "ready to eat food"],
    ["Surf Excel Detergent", "Surf Excel", 399, 499, 100, "detergent"],
    ["Tropicana Orange Juice", "Tropicana", 129, 179, 90, "orange juice"],
    ["Quaker Oats", "Quaker", 199, 299, 80, "oats"],
    ["Hershey Chocolate Syrup", "Hershey", 199, 299, 75, "chocolate syrup"],
    ["Kellogg's Corn Flakes", "Kellogg's", 299, 399, 65, "corn flakes"],
    ["Bournvita Health Drink", "Bournvita", 349, 449, 70, "health drink"],
  ],

  Appliances: [
    ["LG Double Door Refrigerator", "LG", 42999, 52999, 15, "refrigerator"],
    ["Samsung Washing Machine", "Samsung", 34999, 42999, 18, "washing machine"],
    ["Whirlpool Microwave Oven", "Whirlpool", 12999, 15999, 25, "microwave oven"],
    ["Philips Air Fryer", "Philips", 8999, 11999, 30, "air fryer"],
    ["Prestige Mixer Grinder", "Prestige", 3499, 4999, 45, "mixer grinder"],
    ["Havells Electric Kettle", "Havells", 1299, 1999, 70, "electric kettle"],
    ["Bajaj Ceiling Fan", "Bajaj", 1999, 2999, 60, "ceiling fan"],
    ["Voltas Split AC 1.5 Ton", "Voltas", 38999, 45999, 12, "air conditioner"],
    ["Eureka Forbes Water Purifier", "Aquaguard", 11999, 15999, 20, "water purifier"],
    ["Usha Room Heater", "Usha", 2499, 3499, 35, "room heater"],
    ["Panasonic Rice Cooker", "Panasonic", 2999, 3999, 40, "rice cooker"],
    ["Crompton Iron Box", "Crompton", 899, 1299, 80, "iron box"],
    ["Kent Sandwich Maker", "Kent", 1499, 2499, 50, "sandwich maker"],
    ["Dyson Vacuum Cleaner", "Dyson", 39999, 49999, 10, "vacuum cleaner"],
    ["Orient Table Fan", "Orient", 1599, 2299, 55, "table fan"],
    ["Butterfly Gas Stove", "Butterfly", 2999, 4499, 35, "gas stove"],
    ["Bajaj Mixer Grinder", "Bajaj", 2499, 3499, 42, "mixer grinder"],
    ["Philips Induction Cooktop", "Philips", 2999, 3999, 38, "induction cooktop"],
    ["Lifelong Toaster", "Lifelong", 1499, 2499, 55, "toaster"],
    ["Havells Hand Blender", "Havells", 1299, 1999, 65, "hand blender"],
  ],

  Gaming: [
    ["Sony PlayStation 5", "Sony", 54990, 59990, 15, "playstation"],
    ["Xbox Series X", "Microsoft", 52990, 57990, 14, "xbox"],
    ["Nintendo Switch OLED", "Nintendo", 32999, 37999, 20, "nintendo switch"],
    ["Logitech Gaming Mouse", "Logitech", 2499, 3999, 60, "gaming mouse"],
    ["Razer Mechanical Keyboard", "Razer", 6999, 8999, 35, "gaming keyboard"],
    ["HP Omen Gaming Laptop", "HP", 119999, 139999, 10, "gaming laptop"],
    ["Asus ROG Gaming Monitor", "Asus", 24999, 29999, 22, "gaming monitor"],
    ["Redgear Gamepad", "Redgear", 1499, 2499, 70, "gamepad"],
    ["HyperX Gaming Headset", "HyperX", 5999, 7999, 40, "gaming headset"],
    ["Ant Esports Gaming Chair", "Ant Esports", 10999, 14999, 18, "gaming chair"],
    ["Zebronics RGB Mousepad", "Zebronics", 699, 999, 90, "rgb mousepad"],
    ["Cosmic Byte Controller", "Cosmic Byte", 1999, 2999, 65, "controller"],
    ["Steam Gift Card", "Steam", 999, 999, 100, "gaming gift card"],
    ["PS5 DualSense Controller", "Sony", 5990, 6990, 32, "dualsense controller"],
    ["Gaming Desk RGB", "Green Soul", 15999, 19999, 16, "gaming desk"],
    ["Gaming RGB Keyboard", "Redragon", 3499, 4999, 40, "rgb keyboard"],
    ["Gaming Mousepad XL", "Cosmic Byte", 799, 1299, 100, "gaming mousepad"],
    ["VR Headset", "Meta", 29999, 34999, 12, "vr headset"],
    ["Gaming Microphone", "Fifine", 4999, 6999, 35, "gaming microphone"],
    ["Gaming Laptop Stand", "Zebronics", 1499, 2299, 60, "laptop stand"],
  ],

  Furniture: [
    ["Modern Sofa Set", "Urban Ladder", 34999, 44999, 12, "sofa"],
    ["Queen Size Bed", "Wakefit", 24999, 32999, 15, "bed"],
    ["Office Chair Ergonomic", "Green Soul", 8999, 12999, 25, "office chair"],
    ["Dining Table 4 Seater", "HomeTown", 18999, 24999, 18, "dining table"],
    ["Wooden Bookshelf", "HomeCraft", 6999, 9999, 30, "bookshelf"],
    ["TV Unit Cabinet", "Nilkamal", 7999, 10999, 22, "tv unit"],
    ["Coffee Table", "Ikea", 4999, 7999, 35, "coffee table"],
    ["Wardrobe 3 Door", "Godrej", 21999, 28999, 14, "wardrobe"],
    ["Recliner Chair", "Durian", 28999, 35999, 10, "recliner"],
    ["Study Chair", "Cello", 2499, 3999, 45, "study chair"],
    ["Shoe Rack", "Nilkamal", 1999, 2999, 55, "shoe rack"],
    ["Side Table", "HomeCentre", 2999, 4499, 38, "side table"],
    ["Kitchen Cabinet", "HomeTown", 14999, 19999, 16, "kitchen cabinet"],
    ["Bean Bag XL", "Sattva", 1999, 2999, 60, "bean bag"],
    ["Wall Mounted Shelf", "HomeCraft", 1499, 2499, 50, "wall shelf"],
    ["Wooden Computer Desk", "HomeTown", 9999, 14999, 20, "computer desk"],
    ["Plastic Outdoor Chair", "Nilkamal", 999, 1499, 80, "outdoor chair"],
    ["Bedside Table", "Wakefit", 2999, 4499, 35, "bedside table"],
    ["Sofa Cum Bed", "Urban Ladder", 24999, 32999, 10, "sofa bed"],
    ["Folding Study Table", "Cello", 1999, 2999, 55, "folding table"],
  ],

  Books: [
    ["Atomic Habits", "Penguin", 499, 799, 80, "atomic habits book"],
    ["Rich Dad Poor Dad", "Warner Books", 349, 599, 90, "finance book"],
    ["The Psychology of Money", "Harriman House", 399, 699, 75, "money book"],
    ["Ikigai", "Penguin", 299, 499, 85, "ikigai book"],
    ["Deep Work", "Grand Central", 449, 799, 60, "deep work book"],
    ["Clean Code", "Prentice Hall", 2499, 3499, 35, "programming book"],
    ["JavaScript Guide", "O'Reilly", 1799, 2499, 40, "javascript book"],
    ["React Handbook", "TechPress", 999, 1499, 55, "react book"],
    ["Node.js Design Patterns", "Packt", 2199, 2999, 28, "nodejs book"],
    ["MongoDB Basics", "TechPress", 899, 1299, 50, "mongodb book"],
    ["The Alchemist", "HarperCollins", 299, 499, 100, "novel book"],
    ["Wings of Fire", "Universities Press", 249, 399, 95, "abdul kalam book"],
    ["Think and Grow Rich", "Fingerprint", 199, 349, 110, "success book"],
    ["Data Structures in JS", "TechPress", 1299, 1999, 45, "data structures book"],
    ["MERN Stack Project Guide", "EliteBooks", 999, 1599, 40, "mern stack book"],
    ["Start With Why", "Penguin", 399, 699, 70, "business book"],
    ["Zero To One", "Crown Business", 499, 799, 60, "startup book"],
    ["Eloquent JavaScript", "No Starch Press", 1499, 1999, 45, "javascript book"],
    ["You Don't Know JS", "O'Reilly", 1799, 2499, 35, "js book"],
    ["System Design Basics", "EliteBooks", 999, 1499, 50, "system design book"],
  ],
};

const products = Object.entries(productGroups).flatMap(
  ([category, items], categoryIndex) =>
    items.map((item, itemIndex) => {
      const [
        name,
        brand,
        price,
        originalPrice,
        stock,
        imageQuery,
      ] = item;

      const index = categoryIndex * 100 + itemIndex + 1;

      return createProduct({
        name,
        brand,
        category,
        price,
        originalPrice,
        stock,
        imageQuery,
        index,
      });
    })
);

export default products;