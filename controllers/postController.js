const Post = require('../models/Post');
const { asyncHandler } = require('../middlewares/errorHandler');
const { body, validationResult } = require('express-validator');

const postValidation = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('El título debe tener entre 3 y 200 caracteres'),
    body('content')
        .trim()
        .isLength({ min: 10 })
        .withMessage('El contenido debe tener al menos 10 caracteres'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La categoría no puede exceder 50 caracteres')
];

const getPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || null;
    const search = req.query.search || null;

    const result = await Post.findAll({
        page,
        limit,
        status: 'published',
        category,
        search
    });

    const categories = await Post.getCategories();

    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
            success: true,
            data: result.posts,
            pagination: result.pagination
        });
    }

    res.render('posts/index', {
        title: search ? `Búsqueda: ${search}` : category ? `Categoría: ${category}` : 'Todos los Posts',
        posts: result.posts,
        pagination: result.pagination,
        categories,
        currentCategory: category,
        searchQuery: search
    });
});

const getPost = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    
    const post = await Post.findBySlug(slug);
    
    if (!post) {
        const error = new Error('Post no encontrado');
        error.status = 404;
        throw error;
    }

    if (post.status !== 'published') {
        if (!req.user || (post.author_id !== req.user.id && req.user.role !== 'admin')) {
            const error = new Error('Post no encontrado');
            error.status = 404;
            throw error;
        }
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
            success: true,
            data: post
        });
    }

    res.render('posts/show', {
        title: post.title,
        post,
        isAuthor: req.user && (post.author_id === req.user.id || req.user.role === 'admin')
    });
});

const getCreateForm = (req, res) => {
    res.render('posts/create', {
        title: 'Crear Nuevo Post',
        errors: [],
        formData: {}
    });
};

const createPost = [
    ...postValidation,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).render('posts/create', {
                title: 'Crear Nuevo Post',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { title, content, excerpt, category, tags, status, featured_image } = req.body;

        let processedTags = [];
        if (tags) {
            processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        const post = await Post.create({
            title,
            content,
            excerpt: excerpt || null,
            featured_image: featured_image || null,
            category: category || null,
            tags: processedTags,
            status: status || 'published',
            author_id: req.user.id
        });

        req.flash('success', 'Post creado exitosamente');
        res.redirect(`/posts/${post.slug}`);
    })
];

const getEditForm = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
        const error = new Error('Post no encontrado');
        error.status = 404;
        throw error;
    }

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
        req.flash('error', 'No tienes permisos para editar este post');
        return res.redirect(`/posts/${post.slug}`);
    }

    res.render('posts/edit', {
        title: `Editar: ${post.title}`,
        post,
        errors: [],
        formData: {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category,
            tags: post.tags ? post.tags.join(', ') : '',
            status: post.status,
            featured_image: post.featured_image
        }
    });
});

const updatePost = [
    ...postValidation,
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            const error = new Error('Post no encontrado');
            error.status = 404;
            throw error;
        }

        if (post.author_id !== req.user.id && req.user.role !== 'admin') {
            req.flash('error', 'No tienes permisos para editar este post');
            return res.redirect(`/posts/${post.slug}`);
        }

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).render('posts/edit', {
                title: `Editar: ${post.title}`,
                post,
                errors: errors.array(),
                formData: req.body
            });
        }

        const { title, content, excerpt, category, tags, status, featured_image } = req.body;

        let processedTags = [];
        if (tags) {
            processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        const updatedPost = await Post.update(id, {
            title,
            content,
            excerpt: excerpt || null,
            featured_image: featured_image || null,
            category: category || null,
            tags: processedTags,
            status: status || 'published'
        });

        req.flash('success', 'Post actualizado exitosamente');
        res.redirect(`/posts/${updatedPost.slug}`);
    })
];

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
        const error = new Error('Post no encontrado');
        error.status = 404;
        throw error;
    }

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar este post' });
        }
        req.flash('error', 'No tienes permisos para eliminar este post');
        return res.redirect(`/posts/${post.slug}`);
    }

    await Post.delete(id);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, message: 'Post eliminado exitosamente' });
    }

    req.flash('success', 'Post eliminado exitosamente');
    res.redirect('/posts');
});

const getMyPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Post.findByAuthor(req.user.id, { page, limit });

    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
            success: true,
            data: result.posts,
            pagination: result.pagination
        });
    }

    res.render('posts/index', {
        title: 'Mis Posts',
        posts: result.posts,
        pagination: result.pagination,
        myPosts: true
    });
});

module.exports = {
    getPosts,
    getPost,
    getCreateForm,
    createPost,
    getEditForm,
    updatePost,
    deletePost,
    getMyPosts
};
