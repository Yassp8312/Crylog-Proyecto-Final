const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, optionalAuth, requireOwnerOrAdmin } = require('../middlewares/auth');

router.get('/', optionalAuth, postController.getPosts);
router.get('/slug/:slug', optionalAuth, postController.getPost);

router.get('/:slug', optionalAuth, (req, res, next) => {
    const reserved = ['create', 'my-posts', 'slug'];
    if (reserved.includes(req.params.slug)) {
        return next();
    }
    res.redirect(`/posts/slug/${req.params.slug}`);
});

router.get('/my-posts', authenticate, postController.getMyPosts);
router.get('/create', authenticate, postController.getCreateForm);
router.post('/create', authenticate, postController.createPost);

router.get('/:id/edit', authenticate, postController.getEditForm);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router;
