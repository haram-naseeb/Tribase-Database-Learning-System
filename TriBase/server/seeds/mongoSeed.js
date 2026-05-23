const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[rand(0, arr.length - 1)];

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/learndb_social';
  await mongoose.connect(uri);
  console.log('MongoDB Connected. Seeding SocialMediaDB...');

  const db = mongoose.connection.db;

  // Drop collections
  await db.dropDatabase();
  console.log('  Old data cleared.');

  // ── Users (500) ──────────────────────────────────────────────────
  const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Blake', 'Drew'];
  const bios = ['Tech enthusiast', 'Coffee lover ☕', 'Full-stack dev', 'Designer by day', 'Open source contributor', 'Cloud architect', 'Data scientist', 'Gamer & coder', 'Startup founder', 'DevOps engineer'];
  const tags = ['#javascript', '#python', '#mongodb', '#nodejs', '#react', '#css', '#devops', '#cloud', '#ai', '#webdev'];

  const usersData = Array.from({ length: 500 }, (_, i) => ({
    _id: new mongoose.Types.ObjectId(),
    username: `${pick(names).toLowerCase()}_${i + 1}`,
    email: `user${i + 1}@social.learndb.io`,
    bio: pick(bios),
    followers_count: rand(0, 5000),
    following: [],
    tags: [pick(tags), pick(tags)].filter((v, i, a) => a.indexOf(v) === i),
    created_at: new Date(Date.now() - rand(0, 730) * 86400000)
  }));
  await db.collection('users').insertMany(usersData);
  console.log('  ✓ 500 users');

  // ── Posts (2000) ─────────────────────────────────────────────────
  const contents = [
    'Just deployed my first MongoDB app! 🚀', 'Learning NoSQL is a game changer', 'Aggregation pipelines are powerful!',
    'The $lookup stage is basically SQL joins in Mongo 🤯', 'Building a social app with Node + MongoDB',
    'Pro tip: index your query fields!', 'Atlas Charts is amazing for data viz', 'Schema-less doesn\'t mean schema-free',
    'Mongoose makes MongoDB dev so much cleaner', 'Embedded documents vs references — which do you prefer?'
  ];
  const hashtags = ['#mongodb', '#nosql', '#database', '#coding', '#100DaysOfCode', '#webdev', '#backend'];

  const postsData = Array.from({ length: 2000 }, (_, i) => {
    const userId = usersData[rand(0, 499)]._id;
    return {
      _id: new mongoose.Types.ObjectId(),
      user_id: userId,
      content: pick(contents) + ` (#post${i + 1})`,
      media_url: Math.random() > 0.7 ? `https://picsum.photos/seed/${i}/800/400` : null,
      likes: Array.from({ length: rand(0, 50) }, () => usersData[rand(0, 499)]._id),
      comments: Array.from({ length: rand(0, 10) }, () => ({
        user_id: usersData[rand(0, 499)]._id,
        text: pick(['Great post!', 'Thanks for sharing!', 'Totally agree!', 'Interesting!', 'Learned something new!']),
        created_at: new Date(Date.now() - rand(0, 30) * 86400000)
      })),
      hashtags: [pick(hashtags), pick(hashtags)].filter((v, i, a) => a.indexOf(v) === i),
      created_at: new Date(Date.now() - rand(0, 365) * 86400000)
    };
  });
  await db.collection('posts').insertMany(postsData);
  console.log('  ✓ 2000 posts');

  // ── Messages (1000) ──────────────────────────────────────────────
  const msgTexts = ['Hey, how are you?', 'Did you see the latest MongoDB update?', 'Let\'s collaborate!', 'Great work on that PR', 'Can you review my code?', 'When is the meeting?', 'I finished the feature', 'The bug is fixed!', 'Thank you!', 'Sounds good!'];
  const messagesData = Array.from({ length: 1000 }, () => ({
    _id: new mongoose.Types.ObjectId(),
    sender_id: usersData[rand(0, 499)]._id,
    receiver_id: usersData[rand(0, 499)]._id,
    text: pick(msgTexts),
    read: Math.random() > 0.4,
    timestamp: new Date(Date.now() - rand(0, 90) * 86400000)
  }));
  await db.collection('messages').insertMany(messagesData);
  console.log('  ✓ 1000 messages');

  // ── Notifications (3000) ─────────────────────────────────────────
  const notifTypes = ['like', 'comment', 'follow', 'mention', 'system'];
  const notifMessages = {
    like: 'liked your post', comment: 'commented on your post', follow: 'started following you',
    mention: 'mentioned you in a post', system: 'Welcome to LearnDB Social!'
  };
  const notificationsData = Array.from({ length: 3000 }, () => {
    const type = pick(notifTypes);
    return {
      _id: new mongoose.Types.ObjectId(),
      user_id: usersData[rand(0, 499)]._id,
      type,
      ref_id: new mongoose.Types.ObjectId(),
      message: notifMessages[type],
      read: Math.random() > 0.5,
      created_at: new Date(Date.now() - rand(0, 90) * 86400000)
    };
  });
  await db.collection('notifications').insertMany(notificationsData);
  console.log('  ✓ 3000 notifications');

  // Create indexes
  await db.collection('users').createIndex({ username: 1 });
  await db.collection('posts').createIndex({ user_id: 1, created_at: -1 });
  await db.collection('posts').createIndex({ hashtags: 1 });
  await db.collection('messages').createIndex({ sender_id: 1, receiver_id: 1 });
  await db.collection('notifications').createIndex({ user_id: 1, read: 1 });
  console.log('  ✓ Indexes created');

  console.log('\n✅ MongoDB SocialMediaDB seeded successfully!\n');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed error:', err.message); process.exit(1); });
