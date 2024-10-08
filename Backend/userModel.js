import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import expressAsyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const collectionName = 'userCollection';

// Define user schema
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
});

// Create UserModel
const UserModel = mongoose.model(collectionName, userSchema);
const userRouter = express.Router();

const generateOtp = () => {
  crypto.randomInt(100000, 999999).toString();
}


// Function to send an email with the OTP
const sendMail = async (email, otp) => {
  console.log('Entered into sendMail function');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.log('Connection error:', error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. This OTP is valid for 10 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};

// Sign-in route
userRouter.post('/sign-in', async (req, res) => {
  const { email } = req.body;
  const existedEmail = await UserModel.findOne({ email });

  if (!existedEmail) {
    return res.status(404).json({ message: 'Email ID not registered' });
  }
  return res.status(200).json({ message: 'Email exists' });
});

// Send OTP route
userRouter.post('/send-otp', expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log('Generated OTP:', otp);

  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
      await sendMail(email, otp);
      return res.status(200).json({ message: 'OTP sent successfully', otp });
    }
    return res.status(404).json({ message: 'Email ID not registered' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
}));

// Verify OTP route
userRouter.post('/verify-otp', expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email ID not registered' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }
    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
}));

// GET route to fetch a single user by ID
userRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id);
    if (user) {
      return res.status(200).json(user);
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Error while retrieving the user', error: err });
  }
});

// GET route to fetch all users
userRouter.get('/', async (req, res) => {
  try {
    const users = await UserModel.find({});
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Error in backend while fetching user data', error: err });
  }
});

// POST route to create a new user
userRouter.post('/signup', async (req, res) => {
  const { firstname, lastname, email, role, otp } = req.body;

  try {
    const existedEmail = await UserModel.findOne({ email });
    if (existedEmail) {
      return res.status(409).json({ message: 'Email already exists in the database' });
    }
    const newUser = new UserModel({ firstname, lastname, email, role, otp });
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).json({ message: 'Error while inserting the new user record', error: err });
  }
});

// DELETE route to delete a user by ID
userRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (deletedUser) {
      return res.status(200).json({ message: 'User deleted successfully' });
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Error while deleting the user', error: err });
  }
});

// PUT route to update a user by ID
userRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Error while updating the user', error: err });
  }
});

export default userRouter;
