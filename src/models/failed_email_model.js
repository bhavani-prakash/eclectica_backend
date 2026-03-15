import mongoose from "mongoose";

const failedEmailSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    eventName: { type: String, required: true },
    rollnumber: { type: String },
    errorMessage: { type: String, required: true },
    retryCount: { type: Number, default: 0, max: 3 },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }, // pending = needs manual send
    notes: { type: String },
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }
  },
  { timestamps: true }
);

const FailedEmail = mongoose.model("FailedEmail", failedEmailSchema);
export default FailedEmail;
