// models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['business', 'technical', 'educational', 'personal', 'other']
  },
  diagramType: {
    type: String,
    required: true
  },
  nodes: [{
    id: String,
    type: String,
    position: {
      x: Number,
      y: Number
    },
    data: mongoose.Schema.Types.Mixed
  }],
  edges: [{
    id: String,
    source: String,
    target: String,
    type: String,
    data: mongoose.Schema.Types.Mixed
  }],
  preview: {
    thumbnail: String,
    width: Number,
    height: Number
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usage: {
    count: { type: Number, default: 0 },
    lastUsed: Date
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

templateSchema.index({ category: 1, diagramType: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Template', templateSchema);
