const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mrnnjohrkoypvgisubdf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybm5qb2hya295cHZnaXN1YmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Njc5NzQsImV4cCI6MjA3NzI0Mzk3NH0.jOgD7rdmyETDyZmMF5qSi2PwLRAGEq5lzGgjMcWa5oM'
);

async function test() {
  try {
    // First try to see what happens when we try different column names
    console.log('Testing column names in sessions table...\n');

    // Get a profile to use as user_id
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('id').limit(1);
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return;
    }
    const userId = profiles[0].id;
    console.log('Using user_id:', userId);

    // Get a workstation
    const { data: workstations, error: wErr } = await supabase.from('workstations').select('id').limit(1);
    if (!workstations || workstations.length === 0) {
      console.log('No workstations found');
      return;
    }
    const workstationId = workstations[0].id;
    console.log('Using workstation_id:', workstationId, '\n');

    // Try to insert a session with all possible column names
    const { data: insertResult, error: insertErr } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        workstation_id: workstationId,
        created_at: new Date().toISOString()
      })
      .select('*');

    if (insertErr) {
      console.log('Insert error:', insertErr.message);
      
      // Try without created_at
      console.log('\nTrying without created_at...');
      const { data: result2, error: err2 } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          workstation_id: workstationId
        })
        .select('*');
      
      if (err2) {
        console.log('Still error:', err2.message);
      } else {
        console.log('Success! Created session:');
        console.log(JSON.stringify(result2[0], null, 2));
      }
    } else {
      console.log('Success! Created session:');
      console.log(JSON.stringify(insertResult[0], null, 2));
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
}

test();
