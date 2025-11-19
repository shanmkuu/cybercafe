
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mrnnjohrkoypvgisubdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybm5qb2hya295cHZnaXN1YmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Njc5NzQsImV4cCI6MjA3NzI0Mzk3NH0.jOgD7rdmyETDyZmMF5qSi2PwLRAGEq5lzGgjMcWa5oM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Debugging Database ---');

    // 1. Check Workstations
    const { data: workstations, error: wsError } = await supabase.from('workstations').select('*');
    console.log('Workstations:', workstations ? workstations.length : 'Error', wsError || '');
    if (workstations) console.log('Workstation IDs:', workstations.map(w => w.id));

    // 2. Check Sessions (Active)
    const { data: sessions, error: sessError } = await supabase.from('sessions').select('*').eq('status', 'active');
    console.log('Active Sessions:', sessions ? sessions.length : 'Error', sessError || '');
    if (sessions && sessions.length > 0) console.log('Sample Session:', sessions[0]);

    // 3. Check Users Table
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    console.log('Users Table:', users ? users.length : 'Error', usersError || '');
    if (users && users.length > 0) console.log('Sample User:', users[0]);

    // 4. Check Profiles Table
    const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
    console.log('Profiles Table:', profiles ? profiles.length : 'Error', profError || '');
    if (profiles && profiles.length > 0) {
        console.log('Sample Profile Keys:', Object.keys(profiles[0]));
        console.log('Sample Profile:', profiles[0]);
    }

    // 5. Check Files
    const { data: files, error: filesError } = await supabase.from('files').select('*');
    console.log('Files Table:', files ? files.length : 'Error', filesError || '');

    // 6. Check Join (Sessions + Profiles) - Commented out to avoid crash if column missing
    /*
    const { data: joinData, error: joinError } = await supabase
        .from('sessions')
        .select('*, profiles:user_id(full_name)')
        .eq('status', 'active');
    console.log('Sessions + Profiles Join:', joinData ? joinData.length : 'Error', joinError || '');
    */

}

debug();
