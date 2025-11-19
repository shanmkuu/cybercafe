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

export async function getUserActivityLogs(userId) {
    try {
        const { data, error } = await supabase
            .from('file_logs')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getUserActivityLogs error', error);
        return { data: null, error };
    }
}

// --- Admin / Dashboard Helpers ---

export async function getUsers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getUsers error', error);
        return { data: null, error };
    }
}

export async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('updateUserProfile error', error);
        return { data: null, error };
    }
}

export async function deleteUserProfile(userId) {
    try {
        // Note: Deleting a user might have cascading effects or be restricted by FKs.
        // For now, we'll attempt to delete from the profiles table.
        // In a real Supabase app, you might also need to delete from auth.users via Admin API,
        // but that's not available in the client client usually.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('deleteUserProfile error', error);
        return { error };
    }
}

export async function getActiveSessions() {
    try {
        // Join with profiles to get user details
        const { data, error } = await supabase
            .from('sessions')
            .select(`
                *,
                profiles:user_id (full_name, username, avatar_url)
            `)
            .eq('status', 'active')
            .order('start_time', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getActiveSessions error', error);
        return { data: null, error };
    }
}

export async function getAllSessions(days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .gte('start_time', startDate.toISOString())
            .order('start_time', { ascending: true });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getAllSessions error', error);
        return { data: null, error };
    }
}

export async function getWorkstations() {
    try {
        const { data, error } = await supabase
            .from('workstations')
            .select(`
                *,
                sessions:current_session_id (
                    user_id,
                    start_time
                )
            `)
            .order('id', { ascending: true });

        if (error) throw error;

        // If we have active sessions, we might want to fetch the user names for them
        // But for now, let's just return the raw data and handle enrichment in the component if needed
        // Or we could do a deeper join if Supabase supports it easily here. 
        // Actually, let's try to get the user profile from the session if possible.
        // A more complex query might be needed, but let's stick to simple for now.

        return { data, error: null };
    } catch (error) {
        console.error('getWorkstations error', error);
        return { data: null, error };
    }
}

export async function getFileStats() {
    try {
        const { data, error } = await supabase
            .from('files')
            .select('id, size, type, created_at, user_id');

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getFileStats error', error);
        return { data: null, error };
    }
}
