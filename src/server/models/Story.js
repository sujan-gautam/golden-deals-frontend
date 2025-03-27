
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 24 * 60 * 60 // 24 hours in seconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  location: {
    type: String
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Virtual for determining if story is still valid
storySchema.virtual('isActive').get(function() {
  return this.expiresAt > Date.now();
});

module.exports = mongoose.model('Story', storySchema);
