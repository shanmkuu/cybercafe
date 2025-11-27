const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mrnnjohrkoypvgisubdf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybm5qb2hya295cHZnaXN1YmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Njc5NzQsImV4cCI6MjA3NzI0Mzk3NH0.jOgD7rdmyETDyZmMF5qSi2PwLRAGEq5lzGgjMcWa5oM'
);

async function test() {
  try {
    console.log('--- Session Timestamp Test ---\n');

    // Get a recent session
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1);

    if (error || !sessions || sessions.length === 0) {
      console.log('No sessions found');
      return;
    }

    const session = sessions[0];
    console.log('Most recent session:');
    console.log('  ID:', session.id);
    console.log('  User:', session.user_id);
    console.log('  Started at (raw):', session.started_at);
    console.log('  Started at (type):', typeof session.started_at);
    console.log('  Ended at:', session.ended_at);
    
    // Parse the timestamp
    const startedDate = new Date(session.started_at);
    const now = new Date();
    const diffMs = now - startedDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    console.log('\nTime Analysis:');
    console.log('  Now:', now.toISOString());
    console.log('  Session started:', startedDate.toISOString());
    console.log('  Difference:');
    console.log(`    ${diffHours}h ${(diffMinutes % 60)}m ${(diffSeconds % 60)}s ago`);
    console.log(`    ${diffSeconds} seconds`);
    console.log(`    ${diffMs} milliseconds`);

  } catch (err) {
    console.error('Error:', err);
  }
}

test();
