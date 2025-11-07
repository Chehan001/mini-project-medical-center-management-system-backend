require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/userModel'); 

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}

async function generatePassword() {
  // generate a reasonably strong readable password
  return crypto.randomBytes(9).toString('base64').replace(/\W/g, 'A').slice(0, 16);
}

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('ADMIN_EMAIL missing in .env');
    await mongoose.disconnect();
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD;
  const forceReset = (process.env.FORCE_RESET || 'false').toLowerCase() === 'true';

  if (!password) {
    // generate a password 
    password = await generatePassword();
    console.log(' No ADMIN_PASSWORD set. Generated password (capture it now):', password);
  }

  try {
    const existing = await User.findOne({ email });

    const hashed = await bcrypt.hash(password, 10);

    if (existing) {
      if (!forceReset) {
        console.log('Admin already exists. Set FORCE_RESET=true to update password.');
      } else {
        // update password & ensure role is admin
        existing.password = hashed;
        existing.role = 'admin';
        await existing.save();
        console.log(`Admin user exists — password updated for ${email}`);
      }
    } else {
      await User.create({ email, password: hashed, role: 'admin' });
      console.log(`Admin user created: ${email}`);
    }
  } catch (err) {
    console.error('Error creating/updating admin:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
