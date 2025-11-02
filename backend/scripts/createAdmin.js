// Script to create an admin user
// Run with: node backend/scripts/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codeprep';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Define User schema (must match your model)
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      loginAttempts: { type: Number, default: 0 },
      lastLoginAttempt: Date,
      lockedUntil: Date,
      lastLogin: Date,
      resetToken: String,
      resetTokenExpiry: Date,
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const adminEmail = 'admin@codeprep.com';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`\n⚠️  Admin user already exists!`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('\n✅ Updated existing user to admin role');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      loginAttempts: 0,
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('=================================');
    console.log('Email:', admin.email);
    console.log('Password: Admin123!');
    console.log('Role:', admin.role);
    console.log('=================================\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('\nYou can now:');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Login with the credentials above');
    console.log('3. Click on profile icon → "Admin Panel"');
    console.log('4. Access admin dashboard at /admin/dashboard\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

