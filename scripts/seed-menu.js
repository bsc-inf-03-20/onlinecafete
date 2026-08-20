const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/onlinecafete');

  const db = mongoose.connection.db;
  const categories = db.collection('categories');
  const menuItems = db.collection('menuitems');

  await categories.deleteMany({ slug: { $in: ['breakfast', 'drinks'] } });
  await menuItems.deleteMany({
    name: { $in: ['Breakfast Combo', 'Iced Coffee'] },
  });

  const now = new Date();
  const breakfast = await categories.insertOne({
    name: 'Breakfast',
    slug: 'breakfast',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  const drinks = await categories.insertOne({
    name: 'Drinks',
    slug: 'drinks',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  await menuItems.insertMany([
    {
      name: 'Breakfast Combo',
      description: 'Eggs, toast, sausage, and fruit',
      price: 85,
      imageUrl: '/images/breakfast-combo.jpg',
      categoryId: breakfast.insertedId,
      isAvailable: true,
      prepTimeMinutes: 12,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Iced Coffee',
      description: 'Chilled coffee with milk and ice',
      price: 35,
      imageUrl: '/images/iced-coffee.jpg',
      categoryId: drinks.insertedId,
      isAvailable: true,
      prepTimeMinutes: 4,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const seededItems = await menuItems
    .find({ name: { $in: ['Breakfast Combo', 'Iced Coffee'] } })
    .project({ name: 1, price: 1, categoryId: 1 })
    .toArray();

  console.log(JSON.stringify({ categories: { breakfast: String(breakfast.insertedId), drinks: String(drinks.insertedId) }, menuItems: seededItems.map((item) => ({ id: String(item._id), name: item.name, price: item.price, categoryId: String(item.categoryId) })) }, null, 2));

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
