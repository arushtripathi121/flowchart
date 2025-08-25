const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: String,
  position: {
    x: Number,
    y: Number,
  },
  data: mongoose.Schema.Types.Mixed
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: String,
  target: String,
  type: String,
  markerEnd: mongoose.Schema.Types.Mixed,
  style: mongoose.Schema.Types.Mixed,
  data: mongoose.Schema.Types.Mixed,
}, { _id: false });

const DiagramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  diagramType: { type: String, required: true },
  layout: { type: String },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  metadata: mongoose.Schema.Types.Mixed,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Diagram', DiagramSchema);
