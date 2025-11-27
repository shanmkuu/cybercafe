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
                event: 'login'
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
                ended_at: new Date().toISOString(),
                event: 'logout'
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
                action: action, // 'upload', 'download', or 'delete'
                created_at: new Date().toISOString()
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
            .order('created_at', { ascending: false })
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
        // Join with profiles to get user details, filter for sessions without ended_at
        const { data, error } = await supabase
            .from('sessions')
            .select(`
                *,
                profiles:user_id (full_name, username, avatar_url)
            `)
            .is('ended_at', null)
            .order('started_at', { ascending: false });

        if (error) throw error;

        // Deduplicate by user_id so dashboard shows one active session per user
        try {
            const dedupMap = new Map();
            (data || []).forEach(s => {
                const uid = s.user_id || s.profiles?.id || null;
                if (!uid) return; // ignore sessions without a user identifier for dedup count
                const existing = dedupMap.get(uid);
                if (!existing) {
                    dedupMap.set(uid, s);
                } else {
                    // Keep the most recently started session
                    const existingStarted = existing.started_at ? new Date(existing.started_at) : new Date(0);
                    const thisStarted = s.started_at ? new Date(s.started_at) : new Date(0);
                    if (thisStarted > existingStarted) {
                        dedupMap.set(uid, s);
                    }
                }
            });
            const deduped = Array.from(dedupMap.values());
            return { data: deduped, error: null };
        } catch (procErr) {
            console.error('getActiveSessions post-processing error', procErr);
            // Fall back to raw data if processing fails
            return { data, error: null };
        }
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
            .gte('started_at', startDate.toISOString())
            .order('started_at', { ascending: true });

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
                    started_at
                )
            `)
            .order('workstation_id', { ascending: true });

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

// --- Backups ---

export async function createBackup() {
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('backups')
            .insert([{
                started_at: now,
                status: 'in_progress',
                backup_size: 0,
                file_count: 0
            }])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('createBackup error', error);
        return { data: null, error };
    }
}

export async function updateBackupStatus(backupId, status, backupSize = 0, fileCount = 0) {
    try {
        const updates = {
            status: status,
            backup_size: backupSize,
            file_count: fileCount
        };

        if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
        } else if (status === 'failed') {
            updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('backups')
            .update(updates)
            .eq('id', backupId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('updateBackupStatus error', error);
        return { data: null, error };
    }
}

export async function getBackupHistory(limit = 10) {
    try {
        const { data, error } = await supabase
            .from('backups')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getBackupHistory error', error);
        return { data: null, error };
    }
}

// --- System Logs Export ---

export async function getSystemLogsForExport(days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [logsResponse, sessionsResponse, backupsResponse] = await Promise.all([
            supabase
                .from('file_logs')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false }),
            supabase
                .from('sessions')
                .select('*')
                .gte('started_at', startDate.toISOString())
                .order('started_at', { ascending: false }),
            supabase
                .from('backups')
                .select('*')
                .gte('started_at', startDate.toISOString())
                .order('started_at', { ascending: false })
        ]);

        if (logsResponse.error) throw logsResponse.error;
        if (sessionsResponse.error) throw sessionsResponse.error;
        if (backupsResponse.error) throw backupsResponse.error;

        return {
            data: {
                fileLogs: logsResponse.data || [],
                sessions: sessionsResponse.data || [],
                backups: backupsResponse.data || []
            },
            error: null
        };
    } catch (error) {
        console.error('getSystemLogsForExport error', error);
        return { data: null, error };
    }
}

// --- System Health ---

export async function getSystemHealth() {
    try {
        const [workstationsResponse, activeSessionsResponse, fileStatsResponse, backupsResponse] = await Promise.all([
            supabase
                .from('workstations')
                .select('*'),
            supabase
                .from('sessions')
                .select('*')
                .is('ended_at', null),
            supabase
                .from('files')
                .select('*'),
            supabase
                .from('backups')
                .select('*')
                .order('started_at', { ascending: false })
                .limit(1)
        ]);

        if (workstationsResponse.error) throw workstationsResponse.error;
        if (activeSessionsResponse.error) throw activeSessionsResponse.error;
        if (fileStatsResponse.error) throw fileStatsResponse.error;
        if (backupsResponse.error) throw backupsResponse.error;

        const workstations = workstationsResponse.data || [];
        const activeSessions = activeSessionsResponse.data || [];
        const files = fileStatsResponse.data || [];
        const lastBackup = backupsResponse.data?.[0];

        // Calculate health metrics
        const totalWorkstations = workstations.length;
        const activeWorkstations = workstations.filter(w => w.status === 'occupied').length;
        const workstationUtilization = totalWorkstations > 0 ? Math.round((activeWorkstations / totalWorkstations) * 100) : 0;

        // Session health
        const sessionCount = activeSessions.length;
        const sessionHealth = Math.min(100, Math.max(0, 100 - (sessionCount * 5))); // Degradation based on session count

        // Storage health (simulated based on file count)
        const totalFiles = files.length;
        const storageHealth = Math.min(100, Math.max(0, 100 - (totalFiles * 0.5))); // Degradation based on files

        // Network health (simulated)
        const networkHealth = activeSessions.length === 0 ? 100 : Math.min(100, Math.max(50, 100 - (activeSessions.length * 3)));

        // Backup health
        const backupHealth = lastBackup ? (lastBackup.status === 'completed' ? 100 : 50) : 0;

        // Overall system health
        const overallHealth = Math.round((workstationUtilization + sessionHealth + storageHealth + networkHealth + backupHealth) / 5);

        return {
            data: {
                cpu: workstationUtilization,
                memory: sessionHealth,
                storage: storageHealth,
                network: networkHealth,
                backup: backupHealth,
                overall: overallHealth,
                timestamp: new Date().toISOString(),
                activeWorkstations: activeWorkstations,
                totalWorkstations: totalWorkstations,
                activeSessions: sessionCount,
                totalFiles: totalFiles,
                lastBackup: lastBackup ? lastBackup.completed_at : null
            },
            error: null
        };
    } catch (error) {
        console.error('getSystemHealth error', error);
        return { data: null, error };
    }
}

// --- Admin Session Management ---

export async function terminateSession(sessionId) {
    try {
        const { data, error } = await supabase
            .from('sessions')
            .update({
                ended_at: new Date().toISOString(),
                event: 'logout'
            })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('terminateSession error', error);
        return { data: null, error };
    }
}

export async function getSessionDetails(sessionId) {
    try {
        const { data, error } = await supabase
            .from('sessions')
            .select(`
                *,
                profiles:user_id (full_name, username, avatar_url, email)
            `)
            .eq('id', sessionId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('getSessionDetails error', error);
        return { data: null, error };
    }
}
