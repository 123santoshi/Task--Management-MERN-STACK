import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import usermodel from "./userModel.js"


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

app.use("/users",usermodel)
app.get("/users", usermodel)
app.get("/users/:id",usermodel)
app.delete("/users/:id",usermodel)
app.put("/users",usermodel)