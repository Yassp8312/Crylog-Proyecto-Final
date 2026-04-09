const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role || 'user';
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create({ username, email, password, role = 'user' }) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const { data, error } = await supabase
                .from('users')
                .insert([{
                    username,
                    email,
                    password: hashedPassword,
                    role
                }])
                .select()
                .single();

            if (error) throw error;
            return new User(data);
        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? new User(data) : null;
        } catch (error) {
            throw new Error(`Error buscando usuario: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data ? new User(data) : null;
        } catch (error) {
            throw new Error(`Error buscando usuario: ${error.message}`);
        }
    }

    static async findByUsername(username) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? new User(data) : null;
        } catch (error) {
            throw new Error(`Error buscando usuario: ${error.message}`);
        }
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

    static async findAll() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(user => new User(user));
        } catch (error) {
            throw new Error(`Error obteniendo usuarios: ${error.message}`);
        }
    }

    static async update(id, updates) {
        try {
            if (updates.password) {
                const salt = await bcrypt.genSalt(10);
                updates.password = await bcrypt.hash(updates.password, salt);
            }

            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return new User(data);
        } catch (error) {
            throw new Error(`Error actualizando usuario: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            throw new Error(`Error eliminando usuario: ${error.message}`);
        }
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = User;
