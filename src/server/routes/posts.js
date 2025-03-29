
const express = require('express');
const router = express.Router();
const { Post, ProductPost, EventPost } = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get all posts (including products and events)
router.get('/', async (req, res) => {
  try {
    // Fetch from all post types and combine them
    const [regularPosts, productPosts, eventPosts] = await Promise.all([
      Post.find().populate('userId', 'name avatar').sort({ createdAt: -1 }),
      ProductPost.find().populate('userId', 'name avatar').sort({ createdAt: -1 }),
      EventPost.find().populate('userId', 'name avatar').sort({ createdAt: -1 })
    ]);

    // Transform the posts to match the client-side expected format
    const transformedPosts = [...regularPosts, ...productPosts, ...eventPosts].map(post => {
      const user = post.userId;
      return {
        _id: post._id,
        userId: user._id,
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        content: post.content,
        image: post.image,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.createdAt,
        type: post.type,
        // Include type-specific fields
        ...(post.type === 'product' && {
          productName: post.productName,
          price: post.price,
          category: post.category,
          condition: post.condition,
          status: post.status
        }),
        ...(post.type === 'event' && {
          title: post.title,
          date: post.date,
          location: post.location
        })
      };
    });

    res.json(transformedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { type, content, image, ...extraFields } = req.body;
    
    let newPost;
    
    // Create the appropriate post type
    if (type === 'product') {
      const { productName, price, category, condition, status } = extraFields;
      newPost = new ProductPost({
        userId: req.user.id,
        content,
        image,
        type,
        productName,
        price,
        category,
        condition,
        status: status || 'instock'
      });
    } else if (type === 'event') {
      const { title, date, location } = extraFields;
      newPost = new EventPost({
        userId: req.user.id,
        content,
        image,
        type,
        title,
        date,
        location
      });
    } else {
      // Regular post
      newPost = new Post({
        userId: req.user.id,
        content,
        image,
        type: 'post'
      });
    }
    
    await newPost.save();
    
    // Populate the user details before sending the response
    await newPost.populate('userId', 'name avatar');
    
    // Transform to match client-side expected format
    const user = newPost.userId;
    const transformedPost = {
      _id: newPost._id,
      userId: user._id,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      },
      content: newPost.content,
      image: newPost.image,
      likes: newPost.likes || [],
      comments: newPost.comments || 0,
      createdAt: newPost.createdAt,
      type: newPost.type,
      // Include type-specific fields
      ...(newPost.type === 'product' && {
        productName: newPost.productName,
        price: newPost.price,
        category: newPost.category,
        condition: newPost.condition,
        status: newPost.status
      }),
      ...(newPost.type === 'event' && {
        title: newPost.title,
        date: newPost.date,
        location: newPost.location
      })
    };

    res.status(201).json(transformedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Find which model this post belongs to
    let post = await Post.findById(postId);
    let postModel = Post;
    
    if (!post) {
      post = await ProductPost.findById(postId);
      postModel = ProductPost;
    }
    
    if (!post) {
      post = await EventPost.findById(postId);
      postModel = EventPost;
    }
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already liked the post
    const alreadyLiked = post.likes.includes(userId);
    
    // Toggle like
    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }
    
    await post.save();
    
    // Transform response
    res.json({
      _id: post._id,
      likes: post.likes
    });
    
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Determine which post model to use
    let post = await Post.findById(postId);
    let postModel = 'Post';
    
    if (!post) {
      post = await ProductPost.findById(postId);
      postModel = 'ProductPost';
    }
    
    if (!post) {
      post = await EventPost.findById(postId);
      postModel = 'EventPost';
    }
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create new comment
    const newComment = new Comment({
      postId,
      postModel,
      userId,
      content
    });
    
    await newComment.save();
    
    // Increment comment count on post
    post.comments += 1;
    await post.save();
    
    // Populate user details
    await newComment.populate('userId', 'name avatar');
    
    // Transform comment to match client format
    const transformedComment = {
      _id: newComment._id,
      postId: newComment.postId,
      userId: newComment.userId._id,
      user: {
        _id: newComment.userId._id,
        name: newComment.userId.name,
        avatar: newComment.userId.avatar
      },
      content: newComment.content,
      likes: newComment.likes,
      createdAt: newComment.createdAt
    };
    
    res.status(201).json(transformedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Find all comments for this post
    const comments = await Comment.find({ postId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    
    // Transform comments to match client format
    const transformedComments = comments.map(comment => ({
      _id: comment._id,
      postId: comment.postId,
      userId: comment.userId._id,
      user: {
        _id: comment.userId._id,
        name: comment.userId.name,
        avatar: comment.userId.avatar
      },
      content: comment.content,
      likes: comment.likes,
      createdAt: comment.createdAt
    }));
    
    res.json(transformedComments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
