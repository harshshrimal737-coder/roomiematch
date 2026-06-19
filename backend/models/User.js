import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  college: { type: String },
  city: { type: String },
  bio: { type: String },
  avatar: { type: String, default: '' },
  questionnaire: {
    sleepTime: { type: String }, // early, late, flexible
    wakeTime: { type: String }, // early, late, flexible
    cleanliness: { type: Number, min: 1, max: 5 },
    noiseTolerance: { type: String }, // quiet, moderate, loud
    guestsPolicy: { type: String }, // never, sometimes, often
    smokingPolicy: { type: String }, // no, outside, yes
    petsPolicy: { type: String }, // no, yes
    studyHabits: { type: String }, // home, library, cafe
    budget: { type: String }, // low, medium, high
    personality: { type: String }, // introvert, extrovert, ambivert
  },
  isProfileComplete: { type: Boolean, default: false },
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('User', userSchema);