const { supabase } = require('../config/database');

class Post {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.content = data.content;
        this.slug = data.slug;
        this.excerpt = data.excerpt;
        this.featured_image = data.featured_image;
        this.category = data.category;
        this.tags = data.tags || [];
        this.status = data.status || 'published';
        this.author_id = data.author_id;
        this.author = data.author;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create({ title, content, excerpt, featured_image, category, tags, status = 'published', author_id }) {
        try {
            const slug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    title,
                    content,
                    slug,
                    excerpt: excerpt || content.substring(0, 200) + '...',
                    featured_image,
                    category,
                    tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
                    status,
                    author_id
                }])
                .select(`
                    *,
                    author:users(id, username, email)
                `)
                .single();

            if (error) throw error;
            return new Post(data);
        } catch (error) {
            throw new Error(`Error creando post: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    author:users(id, username, email)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data ? new Post(data) : null;
        } catch (error) {
            throw new Error(`Error buscando post: ${error.message}`);
        }
    }

    static async findBySlug(slug) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    author:users(id, username, email)
                `)
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return data ? new Post(data) : null;
        } catch (error) {
            throw new Error(`Error buscando post: ${error.message}`);
        }
    }

    static async findAll({ page = 1, limit = 10, status = 'published', category = null, search = null } = {}) {
        try {
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    author:users(id, username, email)
                `, { count: 'exact' });

            if (status) {
                query = query.eq('status', status);
            }

            if (category) {
                query = query.eq('category', category);
            }

            if (search) {
                query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
            }

            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return {
                posts: data ? data.map(post => new Post(post)) : [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error obteniendo posts: ${error.message}`);
        }
    }

    static async findByAuthor(author_id, { page = 1, limit = 10 } = {}) {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('posts')
                .select(`
                    *,
                    author:users(id, username, email)
                `, { count: 'exact' })
                .eq('author_id', author_id)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return {
                posts: data ? data.map(post => new Post(post)) : [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error obteniendo posts del autor: ${error.message}`);
        }
    }

    static async update(id, updates) {
        try {
            if (updates.title && !updates.slug) {
                updates.slug = updates.title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            const { data, error } = await supabase
                .from('posts')
                .update(updates)
                .eq('id', id)
                .select(`
                    *,
                    author:users(id, username, email)
                `)
                .single();

            if (error) throw error;
            return new Post(data);
        } catch (error) {
            throw new Error(`Error actualizando post: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            throw new Error(`Error eliminando post: ${error.message}`);
        }
    }

    static async getCategories() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('category')
                .not('category', 'is', null);

            if (error) throw error;

            const categories = [...new Set(data.map(post => post.category))].filter(Boolean);
            return categories;
        } catch (error) {
            throw new Error(`Error obteniendo categorías: ${error.message}`);
        }
    }

    isAuthor(userId) {
        return this.author_id === userId;
    }
}

module.exports = Post;
