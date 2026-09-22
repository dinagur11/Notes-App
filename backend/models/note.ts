import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  author:  {
    name:  { type: String },
    email: { type: String },
  },
  content: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model('Note', noteSchema);