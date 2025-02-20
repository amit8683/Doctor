const userModel = require("./../models/userModels")
const bcrypt = require("bcryptjs")
const {hashPassword, comparePassword}= require("./../helper/authHelper")
const jwt = require("jsonwebtoken");
const doctorModel = require("./../models/doctorModel")
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

const registerController=async(req,res) =>{
    try{
        const exisitingUser= await userModel.findOne({email:req.body.email})
        if(exisitingUser){
            return res.status(200).send({message:"USER ALREADY Registered",success:false})
        }
         //register user
          const password  = req.body.password
    const hashedPassword = await hashPassword(password);
    req.body.password = hashedPassword;
    const newUser= new userModel(req.body)
    await newUser.save()
    res.status(200).send({message:"REGISTERED",success:true})

    }catch(error){
        res.status(500).send({
            success: false,
            error
        })
    }

}

const loginController=async(req,res) => {
    try{
        const user = await userModel.findOne({email:req.body.email})    
        if(!user){
            return res.status(404).send({message:"USER NOT FOUND",success:false})
        }
        const ismatch = await bcrypt.compare(req.body.password, user.password);
        if(!ismatch){
            return res.status(404).send({message:"WRONG PASSWORD",success:false})
        }
        const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:'1d'})
        res.status(200).send({message:"Login successful",success:true,token:token})



    }catch(error){
        console.log(error)
        res.status(500).send({message:"ERROR IN LOGIN",success:false})
    }
}

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

const  applyDoctorController =async(req,res) => {
  try{
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notifcation = adminUser.notifcation;
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
      
    });
    
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  }catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while applying doctor"
    })

  }
 } 

const getAllNotificationController= async(req,res)=>{
  try{
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    seennotification.push(notifcation);
    user.notifcation = [];
    user.seennotification = notifcation;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });


  }catch(error){
    console.log(error);
    res.status(500).send({
      message: "Error while getting all notification",
      success: false,
      error,
    })
  }
};

const deleteAllNotificationController = async(req,res)=>{
   try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

const getAllDoctorsController=async (req, res) => {
try{
  const doctors = await doctorModel.find({status : "approved"});
  res.status(200).send({
    success: true,
    message :"Doctor List successfully Fetched",
    data: doctors,
  })

} catch (error) {
  console.log(error);
  res.status(500).send({
    success: false,
    message: "Unable to fetch doctor",
    error,
  })
} 
};


const  bookeAppointmnetController =async (req, res) => {
  try{
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
     req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body)
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notifcation.push({
      type: "New-appointment-request",
      message: `A nEw Appointment Request from ${req.body.userInfo.name}`,
      onCLickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Book succesfully",
    });
  }catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message :"Error while bookeAppointmet",
      error,
    })
  }
}

const bookingAvailabilityController = async (req, res) => {
  try{
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }


  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
}

const userAppointmentsController=async (req,res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
}


module.exports={loginController, registerController,authController,applyDoctorController,getAllNotificationController,
deleteAllNotificationController,getAllDoctorsController, bookeAppointmnetController, bookingAvailabilityController,
userAppointmentsController};