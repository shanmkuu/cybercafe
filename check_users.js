const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mrnnjohrkoypvgisubdf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybm5qb2hya295cHZnaXN1YmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Njc5NzQsImV4cCI6MjA3NzI0Mzk3NH0.jOgD7rdmyETDyZmMF5qSi2PwLRAGEq5lzGgjMcWa5oM'
);

async function debug() {
  try {
    console.log('--- Checking User Tables ---\n');

    // Check profiles
    const { data: profiles } = await supabase.from('profiles').select('id, username');
    console.log('Profiles count:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('Sample profile IDs:');
      profiles.slice(0, 3).forEach(p => {
        console.log(`  - ${p.id} (${p.username})`);
      });
    }

    // Check users table
    const { data: users } = await supabase.from('users').select('id, username');
    console.log('\nUsers table count:', users?.length || 0);
    if (users && users.length > 0) {
      console.log('Sample user IDs:');
      users.slice(0, 3).forEach(u => {
        console.log(`  - ${u.id} (${u.username})`);
      });
    }

    // Try to create a test session with a profile ID
    if (profiles && profiles.length > 0) {
      console.log('\n--- Testing Session Creation ---');
      const testUserId = profiles[0].id;
      console.log('Testing with user ID:', testUserId);

      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          user_id: testUserId,
          event: 'test',
          started_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.log('Error creating session:', error.message);
        console.log('Details:', error.details);
      } else {
        console.log('Success! Session created:', data[0]?.id);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

debug();
