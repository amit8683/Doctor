const  express = require('express');
const {loginController,registerController,authController,applyDoctorController,
getAllNotificationController,deleteAllNotificationController,getAllDoctorsController,
bookeAppointmnetController,bookingAvailabilityController,userAppointmentsController} = require('../controllers/userCtrl');
const router = express.Router();
const authMiddleware = require('./../middlewares/authMiddleware');


//routes
//Login||Post
router.post('/login', loginController);

//REGISTER || POST

router.post('/register',registerController);

//Auth || POST

router.post('/getUserData',authMiddleware,authController);

//Apply Doctor || Doctor
router.post('/apply-doctor',authMiddleware,applyDoctorController);

//Get all Notification || Doctor
router.post('/get-all-notification',authMiddleware,getAllNotificationController);

//Delete Notification || Doctor
router.post('/delete-all-notification',authMiddleware,deleteAllNotificationController);

router.get('/getAllDoctors',authMiddleware,getAllDoctorsController);

//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookeAppointmnetController);

//Booking Avliability
router.post("/booking-availbility",authMiddleware,bookingAvailabilityController);

//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);


module.exports = router;