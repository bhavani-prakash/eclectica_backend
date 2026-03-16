import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    college: { type: String, required: true },
    rollnumber: { type: String, required: true },
    contactnumber: { type: String, required: true },
    whatsappnumber: { type: String, required: true },
    year: { type: String, required: true },
    department: { type: String, required: true },
    event: { type: String, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'success'], default: 'completed' },
    paymentAmount: { type: Number, default: 0 }, // Amount received
    imageUrl: { type: String, default: null }, // Cloudinary URL for payment screenshot
    utrNumber: { type: String, default: null } // UTR number for payment verification
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;

