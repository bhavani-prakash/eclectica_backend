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
    utrnumber: { type: String, required: true },
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;

