const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { getRole, canRead, canWrite } = require('../utils/access');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth);

const MAX_IMPORT_SIZE = 5 * 1024 * 1024; // 5MB
const upload = multer({ limits: { fileSize: MAX_IMPORT_SIZE } });

// A malformed :id (not a valid ObjectId) is "not found", not a server error.
router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  next();
});

// GET /documents — everything the current user owns or has been shared.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const [owned, shared] = await Promise.all([
      Document.find({ owner: userId }).sort({ updatedAt: -1 }),
      Document.find({ 'sharedWith.user': userId }).sort({ updatedAt: -1 }),
    ]);

    const toSummary = (doc, role) => ({
      id: doc._id,
      title: doc.title,
      role,
      updatedAt: doc.updatedAt,
    });

    res.json({
      owned: owned.map((doc) => toSummary(doc, 'owner')),
      shared: shared.map((doc) => toSummary(doc, getRole(doc, userId))),
    });
  })
);

// POST /documents — create a new, empty document owned by the current user.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const doc = await Document.create({ title: title.trim(), owner: req.user.id });
    res.status(201).json(serializeDocument(doc, 'owner'));
  })
);

// POST /documents/import — create a new document from an uploaded file.
router.post(
  '/import',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const { originalname, buffer } = req.file;
    const extension = (originalname.split('.').pop() || '').toLowerCase();
    const allowed = ['txt', 'md', 'docx'];

    if (!allowed.includes(extension)) {
      return res.status(400).json({ error: `Unsupported file type ".${extension}". Allowed: ${allowed.join(', ')}` });
    }

    let text;
    try {
      if (extension === 'docx') {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else {
        text = buffer.toString('utf-8');
      }
    } catch (err) {
      return res.status(400).json({ error: 'Could not read the uploaded file' });
    }

    const title = originalname.replace(/\.[^/.]+$/, '') || 'Imported document';
    const content = textToTiptapDoc(text);

    const doc = await Document.create({ title, content, owner: req.user.id });
    res.status(201).json(serializeDocument(doc, 'owner'));
  })
);

// GET /documents/:id — read one document, if the user has any access.
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const role = getRole(doc, req.user.id);
    if (!canRead(role)) return res.status(403).json({ error: 'You do not have access to this document' });

    res.json(serializeDocument(doc, role));
  })
);

// PATCH /documents/:id — update title and/or content. Editors and the owner only.
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const role = getRole(doc, req.user.id);
    if (!canRead(role)) return res.status(403).json({ error: 'You do not have access to this document' });
    if (!canWrite(role)) return res.status(403).json({ error: 'You do not have permission to edit this document' });

    const { title, content } = req.body || {};
    if (title === undefined && content === undefined) {
      return res.status(400).json({ error: 'Provide title and/or content to update' });
    }
    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ error: 'title cannot be empty' });
    }

    if (title !== undefined) doc.title = title.trim();
    if (content !== undefined) doc.content = content;
    await doc.save();

    res.json(serializeDocument(doc, role));
  })
);

// POST /documents/:id/share — owner-only: grant another user editor/viewer access.
router.post(
  '/:id/share',
  asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const role = getRole(doc, req.user.id);
    if (!canRead(role)) return res.status(403).json({ error: 'You do not have access to this document' });
    if (role !== 'owner') return res.status(403).json({ error: 'Only the owner can share this document' });

    const { email, role: targetRole } = req.body || {};
    if (!email || !['editor', 'viewer'].includes(targetRole)) {
      return res.status(400).json({ error: 'email and role ("editor" or "viewer") are required' });
    }

    const targetUser = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!targetUser) return res.status(404).json({ error: 'No user found with that email' });

    if (String(targetUser._id) === String(doc.owner)) {
      return res.status(400).json({ error: 'The owner already has full access' });
    }

    const existing = doc.sharedWith.find((entry) => String(entry.user) === String(targetUser._id));
    if (existing) {
      existing.role = targetRole;
    } else {
      doc.sharedWith.push({ user: targetUser._id, role: targetRole });
    }
    await doc.save();

    res.json(serializeDocument(doc, 'owner'));
  })
);

function serializeDocument(doc, role) {
  return {
    id: doc._id,
    title: doc.title,
    content: doc.content,
    role,
    owner: doc.owner,
    sharedWith: doc.sharedWith,
    updatedAt: doc.updatedAt,
  };
}

// Converts plain extracted text into a minimal Tiptap JSON document: one
// paragraph per non-empty line. Keeps import simple and ignores formatting.
function textToTiptapDoc(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const content = lines.length
    ? lines.map((line) => ({ type: 'paragraph', content: [{ type: 'text', text: line }] }))
    : [{ type: 'paragraph' }];

  return { type: 'doc', content };
}

module.exports = router;
