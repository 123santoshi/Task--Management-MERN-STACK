import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import {userRouter} from "./userModel.js"
import taskmodel from "./taskModel.js"


const app = express();
const port = 8000;

app.use(cors());

app.use(express.json());

const mongooseUrl = "mongodb://localhost:27017/task-management-db";

mongoose.connect(mongooseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/",async(req,res)=> res.json("get method calling "))

app.use("/users",userRouter)
app.get("/users", userRouter)
app.get("/users/:id",userRouter)
app.delete("/users/:id",userRouter)
app.get("/users/invite/:id",userRouter)
app.put("/users",userRouter)


app.use("/tasks", taskmodel)
app.get("/tasks",taskmodel)
app.get("/tasks/taskstatus",taskmodel)
app.get("/tasks/:id",taskmodel)
app.post("/tasks/logtime/:id",taskmodel);
app.post("/tasks", taskmodel)
app.delete("/tasks/:id",taskmodel)
app.put("/tasks/:id",taskmodel)



