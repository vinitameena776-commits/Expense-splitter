const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');

//REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//LOGIN
const login =async(reqq,res) =>{
  try{
    const{email,password}=req.body;

    //step 1:Find user email
    const user=await User.findOne({email});
    if(!user){
      return res.status(400).json({
        messgae:'Invalid email or password'
      });
    }

    //Step 2:Compare password with stored hash
    const isPasswordCorrect=await bcrypt.compare(
      password,
      user.password
    );
    if(!isPasswordCorrect){
      return res.status(400).json({
        message:'Invalid email or password'
      });
    }

    //Step 3: Create JWT token
    const token=jwt.sign(
      {userId:user._id},
      process.env.JWT_SECRET,
      {expiresIn:'7d'}
    );

    //Step 4:Send token back
    res.status(200).json({
      messsage:'Login successful',
      token,
      user:{
        id:user._id,
        name:user.name,
        email:user.email
      }
    });
  } catch ()
}

module.exports = { register };