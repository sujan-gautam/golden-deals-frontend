
const mongoose = require('mongoose');

const basePostSchema = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: ['post', 'product', 'event']
  }
};

const postSchema = new mongoose.Schema({
  ...basePostSchema
});

const productPostSchema = new mongoose.Schema({
  ...basePostSchema,
  productName: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  condition: {
    type: String
  },
  status: {
    type: String,
    enum: ['instock', 'lowstock', 'soldout'],
    default: 'instock'
  }
});

const eventPostSchema = new mongoose.Schema({
  ...basePostSchema,
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

const Post = mongoose.model('Post', postSchema);
const ProductPost = mongoose.model('ProductPost', productPostSchema);
const EventPost = mongoose.model('EventPost', eventPostSchema);

module.exports = {
  Post,
  ProductPost,
  EventPost
};
