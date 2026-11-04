const mongoose = require('mongoose');

const sharedWithSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['editor', 'viewer'], required: true },
  },
  { _id: false }
);

// Default content is an empty Tiptap doc: one empty paragraph.
const emptyTiptapDoc = () => ({ type: 'doc', content: [{ type: 'paragraph' }] });

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: mongoose.Schema.Types.Mixed, default: emptyTiptapDoc },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: { type: [sharedWithSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
