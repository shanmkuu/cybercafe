const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mrnnjohrkoypvgisubdf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybm5qb2hya295cHZnaXN1YmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Njc5NzQsImV4cCI6MjA3NzI0Mzk3NH0.jOgD7rdmyETDyZmMF5qSi2PwLRAGEq5lzGgjMcWa5oM'
);

async function debug() {
  try {
    console.log('--- Debugging Sessions ---\n');

    // 1. Check all sessions
    const { data: allSessions, error: allError } = await supabase
      .from('sessions')
      .select('*');
    
    console.log('All sessions count:', allSessions?.length || 0);
    if (allSessions && allSessions.length > 0) {
      console.log('Sample sessions:');
      allSessions.slice(0, 3).forEach(s => {
        console.log(`  - ID: ${s.id}`);
        console.log(`    User: ${s.user_id}`);
        console.log(`    Event: ${s.event}`);
        console.log(`    Started: ${s.started_at}`);
        console.log(`    Ended: ${s.ended_at}`);
      });
    }

    // 2. Check active sessions (ended_at IS NULL)
    const { data: activeSessions, error: activeError } = await supabase
      .from('sessions')
      .select('*')
      .is('ended_at', null);
    
    console.log('\nActive sessions (ended_at IS NULL):', activeSessions?.length || 0);
    if (activeSessions && activeSessions.length > 0) {
      console.log('Active session details:');
      activeSessions.forEach(s => {
        console.log(`  - ID: ${s.id}`);
        console.log(`    User: ${s.user_id}`);
        console.log(`    Event: ${s.event}`);
        console.log(`    Started: ${s.started_at}`);
      });
    }

    // 3. Check if there are any errors
    if (allError) console.log('All sessions error:', allError);
    if (activeError) console.log('Active sessions error:', activeError);

    // 4. Check users
    const { data: users } = await supabase.from('users').select('id, username, email');
    console.log('\nUsers count:', users?.length || 0);

    // 5. Check profiles
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, username');
    console.log('Profiles count:', profiles?.length || 0);

  } catch (err) {
    console.error('Error:', err);
  }
}

debug();
