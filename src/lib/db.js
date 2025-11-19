import { supabase } from './supabase';

/**
 * Database helpers
 */

// --- Files ---

export async function saveFileRecord(fileMetadata) {
    try {
        const { data, error } = await supabase
            .from('files')
            .insert([fileMetadata])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('saveFileRecord error', error);
        return { data: null, error };
    }
}

export async function getUserFiles(userId) {
    try {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getUserFiles error', error);
        return { data: null, error };
    }
}

export async function deleteFileRecord(id) {
    try {
        const { error } = await supabase
            .from('files')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('deleteFileRecord error', error);
        return { error };
    }
}

// --- Sessions ---

export async function createSession(userId, workstationId) {
    try {
        const { data, error } = await supabase
            .from('sessions')
            .insert([{
                user_id: userId,
                workstation_id: workstationId,
                start_time: new Date().toISOString(),
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('createSession error', error);
        return { data: null, error };
    }
}

export async function endSession(sessionId) {
    try {
        const { data, error } = await supabase
            .from('sessions')
            .update({
                end_time: new Date().toISOString(),
                status: 'completed'
            })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('endSession error', error);
        return { data: null, error };
    }
}

// --- Logs ---

export async function logFileActivity(userId, fileName, action) {
    try {
        const { error } = await supabase
            .from('file_logs')
            .insert([{
                user_id: userId,
                file_name: fileName,
                action: action, // 'upload' or 'download'
                timestamp: new Date().toISOString()
            }]);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('logFileActivity error', error);
        return { error };
    }
}
