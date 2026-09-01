const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

async function resetPassword() {
  try {
    await mongoose.connect(MONGO_URI);

    const email = 'vdmeena2325@gmail.com';
    const newPassword = 'Vini@2004';

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      console.log('User not found');
    } else {
      console.log('Password reset successfully for:', user.email);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetPassword();