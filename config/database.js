const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_KEY son requeridas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar conexión
const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.error('Error conectando a Supabase:', error.message);
            return false;
        }
        console.log('✅ Conectado exitosamente a Supabase');
        return true;
    } catch (err) {
        console.error('Error de conexión:', err.message);
        return false;
    }
};

module.exports = {
    supabase,
    testConnection
};
