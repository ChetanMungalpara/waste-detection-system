import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
  },
  lpuUid: {
    type: String,
    required: [true, 'Please provide your LPU UID'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  points: {
    type: Number,
    default: 0,
  },
  history: [
    {
      itemDetected: String,
      category: String,
      pointsEarned: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.models.User || mongoose.model('User', UserSchema);