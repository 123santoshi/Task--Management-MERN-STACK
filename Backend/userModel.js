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
  username: {
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
    enum: ['Admin', 'User'],
    default: 'User',
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  active:{
    type:Boolean,
    default:true
  }
});

// Create UserModel
const UserModel = mongoose.model(collectionName, userSchema);
const userRouter = express.Router();

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
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
    html: `Your OTP code is <strong>${otp}</strong>. This OTP is valid for 10 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};


const sendUserAddedMail = async (username , email) => {
  console.log('Entered into send user added emmail function');
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
    subject: 'Congratulations!! Welcome to Task Timer', 
    html: `
      <div style="max-width: 600px; margin: 20px auto; padding: 0; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="background-color: lightblue; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
        <h2 style="margin: 0; color: black;">Welcome to Task Timer!</h2>
    </div>
    <div style="padding: 20px; background-color: white; border-radius: 0 0 10px 10px;">
        <h3 style="color: #333; margin-top: 0;">Hi <strong>${username}</strong>,</h3>
        <p style="font-size: 15px; color: #555; line-height: 1.5;">
            We’ve successfully onboarded you, and you are now set up to begin your tasks. We look forward to working together and are excited for the contributions you’ll bring to the team.
        </p>  
    <div style="width: 50%; padding: 10px; margin: 20px auto; background-color: lightblue; color: black; border-radius: 5px; font-weight: bold;">
            <a  href="http://localhost:3000/login" style="display: block;  font-size: 16px;  border-radius: 5px; font-weight: bold; text-align: center; text-decoration: none; transition: background-color 0.3s ease, color 0.3s ease;">Click here to join us </a>
        </div>

     <div style="width: 50%; padding: 10px; margin: 20px auto; background-color: lightgray; color: black; border-radius: 5px; font-weight: bold;">
            <p style="text-align: center; margin: 0;"><strong>Username : </strong> <span>${email}</span></p>
        </div>

        <p style="font-size: 15px; color: #777; line-height: 1.5; margin-bottom: 20px;">
            Please feel free to reach out if you have any questions or need assistance as you get started.
        </p>
        <h4 style="color: #333; margin-bottom: 5px;">Best regards,</h4>
        <h4 style="color: #333; margin: 0;">Task Timer Team</h4>
    </div>
</div>

   `
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
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
      await sendMail(email, otp);
      return res.status(200).json({ message: 'OTP sent successfully', otp });
    }
    return res.status(404).json({ message: 'Email ID not registered.' });
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
    return res.status(200).json({ message: 'OTP verified successfully' , role: user.role , username : user.username});
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


//send invitaton to the user
userRouter.get("/invite/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("username==", user.username, "email==", user.email);
    await sendUserAddedMail(user.username, user.email);
    res.status(200).json({ message: "Invite sent successfully" });
  } catch (err) {
    console.error("Error sending invite:", err.message);
    res.status(500).json({ error: "Invite not sent", details: err.message });
  }
});


//fecth to get active users 
/*userRouter.get('/activeusers', async (req, res) => {
  try {
    const users = await UserModel.find({active:true});
    console.log("active users==",users);
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Error in backend while fetching active users data', error: err });
  }
});

//fetch to get the inactive users 
userRouter.get('/inactiveusers', async (req, res) => {
  try {
    const users = await UserModel.find({active:false});
    console.log("inactive users==",users);
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Error in backend while fetching inactive users data', error: err });
  }
});
*/

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
  const { username, email, role } = req.body;

  try {
    const existedEmail = await UserModel.findOne({ email });
    if (existedEmail) {
      return res.status(409).json({ message: 'Email already exists in the database' });
    }
    const newUser = new UserModel({ username, email, role });
    await newUser.save();
    const res_send_user_email = await sendUserAddedMail(username,email);
    console.log("res form send user mail==",res_send_user_email)
    return res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).json({ message: 'Error while inserting the new user record', error: err });
  }
});

userRouter.post('/bulk-upload', async (req, res) => {
  const users = req.body;
  try {
    const existingEmails = await UserModel.find({ email: { $in: users.map(user => user.email) } }); 
    if (existingEmails.length > 0) {
      return res.status(409).json({ 
        message: 'Some emails already exist in the database', 
        existingEmails: existingEmails.map(user => user.email) 
      });
    }
    const newUsers = await UserModel.insertMany(users); 
    for (const user of newUsers) {
      await sendUserAddedMail(user.username, user.email);
    }
    return res.status(201).json(newUsers);
  } catch (err) {
    return res.status(500).json({ message: 'Error while inserting new user records', error: err });
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



export { userRouter, UserModel };