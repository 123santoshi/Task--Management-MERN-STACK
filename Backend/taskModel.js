import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import schedule from 'node-schedule';
import cron from 'node-cron';
import {UserModel} from "./userModel.js"
import expressAsyncHandler from 'express-async-handler';
import axios from 'axios';

dotenv.config({ path: './.env' });

const collectionName = 'taskcollection';

const taskSchema = new mongoose.Schema({
  taskname: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCollection', // Assuming there is a 'User' model
  },
  startdate: {
    type: Date,
    default: Date.now,
  },
  enddate: {
    type: Date,
  },
  taskstatus: {
    type: String,
    default: 'New',
  },
  taskpriority:{
    type:String,
    default:'Critical'
  },
  isrecurring:{
    type:Boolean,
    default:false
  },
  recuringfrequency: {
     type: String
  },
  recuringenddate:{
    type:Date
  },
  spent_time: [{
    time: { type: String },
    description: { type: String ,default:"Automatic Time Logged" },
    logdate: { type: Date, default: Date.now }
  }]  ,
  history: [
    {
      changedby: { type: String }, 
      oldstatus: { type: mongoose.Schema.Types.Mixed  }, 
      newstatus: {type: mongoose.Schema.Types.Mixed  }, 
      changedat: { type: Date, default: Date.now } 
    }
  ]
});

const taskModel = mongoose.model(collectionName, taskSchema);
const taskRouter = express.Router();
const TaskStatus= ["New", "NotStarted", "InProgress", "DevCompleted", "Testing", "Completed"]
const Priority=["Critical","High","Low","Medium"]


const sendTaskAddedMail = async (username, email, taskname) => {
  console.log('Sending task assignment email...');
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
    subject: 'New Task has been assigned to you',
    html: `
      <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); background-color: #f9f9f9;">
        <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center;">
            <h4 style="margin: 0;">New Task Assigned</h4>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
            <h3 style="color: #333;">Hi ${username},</h3>
            <p style="font-size: 15px; color: #555; line-height: 1.5;">
                A new task, <strong>${taskname}</strong>, has been assigned to you in the Task Timer dashboard.
            </p>
            <p style="font-size: 14px; color: #777; line-height: 1.4;">
                You can log in to your account to view the task details and start working on it.
            </p>
            <a href="http://yourdashboardlink.com" style="display: inline-block; padding: 10px 15px; margin-top: 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Task</a>
            <h4 style="color: #333; margin-top: 20px;">Best regards,</h4>
            <h4 style="color: #333; margin: 0;">Task Timer Team</h4>
        </div>
      </div>


    `,
  };

  return transporter.sendMail(mailOptions);
};





//send mail if the task is due 
const sendTaskDueMail = async (username, email, taskname) => { 
  console.log('Sending task due reminder email...');
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
 console.log("username==",username,"tasknmae==",taskname,"emaill===",email);
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Task Due Reminder: Action Required',
    html: `
      <div style="max-width: 600px; margin: auto; border: 1px solid #d9534f; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); background-color: #fff;">
        <div style="background-color: #d9534f; color: white; padding: 15px; text-align: center;">
            <h4 style="margin: 0;">Task Due Reminder</h4>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
            <h3 style="color: #333;">Hello ${username},</h3>
            <p style="font-size: 15px; color: #555; line-height: 1.5;">
                This is a friendly reminder that the task <strong>${taskname}</strong> is due Today.
            </p>
            <p style="font-size: 14px; color: #777; line-height: 1.4;">
                Please log in to your account to check the task details and complete it before the deadline.
            </p>
            <a href="http://yourdashboardlink.com" style="display: inline-block; padding: 10px 15px; margin-top: 15px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 5px;">View Task</a>
            <h4 style="color: #333; margin-top: 20px;">Best regards,</h4>
            <h4 style="color: #333; margin: 0;">Task TimerTeam</h4>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};



const setRecurringTasks = async () => {
  try {
    const data = await taskModel.find({});
    const recurrenceDays = {
      daily: 1,
      weekly: 7,
      monthly: 30,
    };
    console.log("tasks data==", data);
    for (let item of data) {  
      if (item.isrecurring) { 
        const recur_freq_days = recurrenceDays[item.recuringfrequency];
        console.log("recurrence frequency days==", recur_freq_days);
        
        let currentTaskDate = new Date(item.startdate); 
        const recurring_end_date = new Date(item.recuringenddate); 
        if (currentTaskDate <= recurring_end_date) {

          await taskModel.updateOne(
            { _id: item._id }, 
            { taskstatus: "Completed" } 
          );

          const newTask = new taskModel({
            taskname: item.taskname,
            owner: item.owner,
            taskstatus: item.taskstatus,
            isrecurring: item.isrecurring,
            recurringfrequency: item.recuringfrequency,
            recurringenddate: item.recuringenddate,
            startdate:currentTaskDate, 
            enddate: item.enddate,
          });
          currentTaskDate.setDate(currentTaskDate.getDate() + recur_freq_days);
          await newTask.save();
          console.log("New recurring task saved:", newTask);
        }
      }
    }
  } catch (error) {
    console.error("Error setting recurring tasks:", error);
  }
};


cron.schedule('55 10 * * *', () => {
  console.log('Running a task on the everyday at 9 AM');
  setRecurringTasks();
  helloWorld();
});


const helloWorld = ()=>{
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
    to: "santhoshi@snovasys.com",
    subject: 'New Task has been assigned to you',
    html: `
      <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); background-color: #f9f9f9;">
        <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center;">
            <h4 style="margin: 0;">Recurring Tasks Job Runned</h4>
        </div>
        <div>
          <h1>Recurring jobs running </h1>
        </div>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
}


 
cron.schedule('30 9 * * *', async () => {
  try {
    const cur_date = new Date();
    console.log("Current date:", cur_date);
    const tasks = await taskModel.find({}).populate('owner', 'username email');   
    console.log("all tasks=",tasks);
    if (tasks && tasks.length > 0) {
      for (const item of tasks) {
        const end_date = new Date(item.enddate); 
        if (end_date <= cur_date) { 
          await sendTaskDueMail(item.owner.username, item.owner.email, item.taskname);
          console.log(`Email sent for task: ${item.taskname} to ${item.owner.username}`);
        }
      }
    } else {
      console.log("No tasks found.");
    }

  } catch (err) {
    console.error("Error while sending the task due mail:", err);
  }
});


//Post method to insert the log time
taskRouter.post("/logtime/:id", async (req, res) => {
  const { id } = req.params;
  const { time, description } = req.body;
  console.log("time==",time, "description==",description);
  try {
    const task = await taskModel.findById(id);
     if (task) {
      task.spent_time.push({ time, description });
      await task.save();
      res.status(200).json({ message: 'Log time successfully added to the task' });
    } else {
      res.status(404).json({ message: 'Task not found to insert log time' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while inserting log time' });
  }
});




// POST method to add a new task

taskRouter.post(
  '/',
  expressAsyncHandler(async (req, res) => {
    const { owner, enddate, taskname, ...rest } = req.body;
    try {
      // Validate owner as ObjectId
      if (!mongoose.Types.ObjectId.isValid(owner)) {
        return res.status(400).json({ error: 'Invalid owner ID format' });
      }

      // Parse enddate if it exists
      const parsedEndDate = enddate ? new Date(enddate) : undefined;
      if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: 'Invalid end date format' });
      }

      // Create the new task with the valid data
      const ownerId = new mongoose.Types.ObjectId(owner); // Ensure owner is an ObjectId
      const newTask = new taskModel({
        owner: ownerId,
        taskname,
        enddate: parsedEndDate,
        ...rest, // Spread other fields like taskstatus, isrecurring, etc.
      });

      // Save the new task
      await newTask.save();

      // Populate the owner field with the necessary details
      const populatedTask = await taskModel
        .findById(newTask._id)
        .populate('owner', 'username email'); // Populate the owner's username and email

      if (!populatedTask) {
        return res.status(500).json({ error: 'Error fetching task owner details' });
      }

      // Extract owner details and send an email
      const { username, email } = populatedTask.owner;
      await sendTaskAddedMail(username, email, taskname);

      // Return the newly created task with populated owner details
      return res.status(201).json(populatedTask);

    } catch (err) {
      console.error('Error creating task:', err.message); // Log the error to the console
      return res.status(500).json({
        error: 'Error while inserting the new task',
        details: err.message,
      });
    }
  })
);

//get the taskstatus
taskRouter.get("/taskstatus", async(req,res)=>{
  try{
    res.json({TaskStatus})
  }
  catch(err){
    res.status(500).json({error:" Error while fetching the task statuses"  , details:err.response})
  }
})

//to get the priorities
taskRouter.get("/priorities", async(req,res)=>{
  try{
    res.json({Priority})
  }
  catch(err){
    res.status(500).json({error:" Error while fetching the Priorities list"  , details:err.response})
  }
})




// Get a task by ID
taskRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ error: 'Task ID not found to fetch the data' });
  }
  try {
    const data = await taskModel.findById(id).populate('owner','username'); 
    console.log("data==",data);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err) {
    res.status(500).json({
      error: 'Error while fetching the task',
      details: err.message,
    });
  }
});

// Get all tasks
taskRouter.get('/', async (req, res) => {
  try {
    const data = await taskModel.find({}).populate('owner', 'username');
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: 'Error while fetching the tasks data',
      details: err.message,
    });
  }
});


// PUT route to update the task
taskRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const changedBy = req.body.username; 
  try {
    const existingTask = await taskModel.findById(id).populate('owner', 'username');

    if (!existingTask) {
      return res.status(404).json({ error: 'Task ID not found to update the task' });
    }

    const changes = [];
    const new_data = {};

    const checkAndLogChange = (field, oldValue, newValue) => {
      if (oldValue !== newValue && newValue !== undefined) {
        changes.push({
          changedby: changedBy,
          oldstatus: { field, value: oldValue },
          newstatus: { field, value: newValue },
          changedat: new Date(),
        });
        new_data[field] = newValue;
      }
    };

    // Helper function to format dates to 'YYYY-MM-DD'
    const formatDate = (dateValue) => {
      return dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
    };

    // Check and log changes for each field
    checkAndLogChange('taskname', existingTask.taskname, req.body.taskname);
    checkAndLogChange('startdate', formatDate(existingTask.startdate), formatDate(req.body.startdate));
    checkAndLogChange('owner', existingTask.owner?._id, req.body.owner);
    checkAndLogChange('enddate', formatDate(existingTask.enddate), formatDate(req.body.enddate));
    checkAndLogChange('taskpriority', existingTask.taskpriority, req.body.taskpriority); // Correct handling of taskpriority
    checkAndLogChange('taskstatus', existingTask.taskstatus, req.body.taskstatus);
    checkAndLogChange('isrecurring', existingTask.isrecurring, req.body.isrecurring);
    checkAndLogChange('recuringfrequency', existingTask.recuringfrequency, req.body.recuringfrequency);
    checkAndLogChange('recuringenddate', formatDate(existingTask.recuringenddate), formatDate(req.body.recuringenddate));

    // If changes were detected, append them to the task's history
    if (changes.length > 0) {
      existingTask.history.push(...changes);
      new_data.history = existingTask.history; 
    }

    // Update the task with only modified fields
    const updatedTask = await taskModel.findByIdAndUpdate(id, {
      ...existingTask.toObject(),
      ...new_data // Only updated fields
    }, { new: true }).populate('owner', 'username');

    if (updatedTask) {
      return res.status(200).json(updatedTask);
    } else {
      return res.status(404).json({ error: 'Task ID not found to update the task' });
    }

  } catch (err) {
    console.error("Error while updating the task:", err.message);
    return res.status(500).json({
      error: 'Error while updating the task',
      details: err.message,
    });
  }
});






// Update a task
/*taskRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  console.log("re body==",req.body);
  const new_data = {
    ...req.body,
    
  };
  console.log("New data to update:", new_data);
  try {
    const updatedTask = await taskModel.findByIdAndUpdate(id, new_data, { new: true })
      .populate('owner', 'username');

    if (updatedTask) {
      console.log("Updated task:", updatedTask);
      res.status(200).json(updatedTask);
    } else {
      res.status(404).json({ error: 'Task ID not found to update the task' });
    }
  } catch (err) {
    console.error("Error while updating the task:", err.message);
    res.status(500).json({
      error: 'Error while updating the task',
      details: err.message,
    });
  }
});*/





// Delete a task
taskRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await taskModel.findByIdAndDelete(id);
    if (data) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err) {
    res.status(500).json({
      error: 'Error while deleting the task',
      details: err.message,
    });
  }
});







export default taskRouter;
