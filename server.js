const express = require('express');
const colors = require("colors");
const moragan = require("morgan");
const dotenv = require("dotenv");
const connectDB= require('./config/db');
const userRoute = require('./routes/userRoutes');
const adminRoute = require('./routes/adminRoutes');
const doctorRoute = require('./routes/doctorRoutes');
const cors = require('cors');

//connect to Databse
connectDB();

//dotenv config
dotenv.config();

//rest obejct
const app = express();

app.use(cors());


//middlewares
app.use(express.json());
app.use(moragan("dev"));

//port
const port = process.env.PORT || 55;

//router
app.use('/api/v1/user',userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/doctor", doctorRoute);


app.listen(port,()=>{
    console.log(`Server listening in ${process.env.NODE_MODE} Mode on port number ${process.env.PORT}`.bgCyan.white)
});