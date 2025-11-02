// Script to make an existing user an admin
// Run with: node backend/scripts/makeUserAdmin.js <email>

const mongoose = require('mongoose');
require('dotenv').config();

const makeUserAdmin = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('\n❌ Error: Please provide an email address');
      console.log('Usage: node backend/scripts/makeUserAdmin.js <email>');
      console.log('Example: node backend/scripts/makeUserAdmin.js user@example.com\n');
      process.exit(1);
    }

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codeprep';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Define User schema
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

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\nMake sure:');
      console.log('1. The email is correct');
      console.log('2. The user has registered in the system');
      console.log('3. You are connected to the correct database\n');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('User found:');
    console.log('=================================');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Current Role:', user.role || 'user');
    console.log('=================================\n');

    if (user.role === 'admin') {
      console.log('✅ User is already an admin!\n');
      await mongoose.disconnect();
      return;
    }

    // Update to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User successfully promoted to admin!\n');
    console.log('Updated Details:');
    console.log('=================================');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('New Role:', user.role);
    console.log('=================================\n');
    
    console.log('Next steps:');
    console.log('1. User needs to logout and login again');
    console.log('2. After login, "Admin Panel" will appear in profile dropdown');
    console.log('3. Click "Admin Panel" to access /admin/dashboard\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeUserAdmin();

