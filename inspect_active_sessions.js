/**
 * Inspect active sessions in the database
 * Shows all sessions with ended_at IS NULL and their user details
 * 
 * Requires .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * Or set them as environment variables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('Please set these in .env.local or as environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('\n=== Active Sessions Inspection ===\n');

  try {
    // Get all active sessions (no filtering)
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        id,
        user_id,
        event,
        started_at,
        ended_at,
        profiles:user_id (id, full_name, username, email, role)
      `)
      .is('ended_at', null)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      process.exit(1);
    }

    console.log(`Total active sessions (ended_at IS NULL): ${sessions?.length || 0}\n`);

    if (!sessions || sessions.length === 0) {
      console.log('✓ No active sessions found.');
      process.exit(0);
    }

    // Group by user_id to show deduplication
    const userMap = new Map();
    sessions.forEach(s => {
      const uid = s.user_id;
      if (!userMap.has(uid)) {
        userMap.set(uid, []);
      }
      userMap.get(uid).push(s);
    });

    console.log(`Unique users with active sessions: ${userMap.size}\n`);

    // Display each session
    sessions.forEach((s, idx) => {
      const profile = s.profiles || {};
      const age = s.started_at
        ? Math.round((Date.now() - new Date(s.started_at)) / 1000)
        : 'unknown';

      console.log(`[${idx + 1}] Session ID: ${s.id}`);
      console.log(`    User: ${profile.full_name || 'Unknown'} (${profile.username || 'N/A'})`);
      console.log(`    Email: ${profile.email || 'N/A'}`);
      console.log(`    Role: ${profile.role || 'N/A'}`);
      console.log(`    Event: ${s.event}`);
      console.log(`    Started: ${s.started_at || 'unknown'}`);
      console.log(`    Age: ${age}s`);
      console.log('');
    });

    // Show deduplication summary
    console.log('\n=== Deduplication Summary ===');
    console.log(`Raw sessions: ${sessions.length}`);
    console.log(`Unique users: ${userMap.size}`);
    console.log(`Would be deduplicated from: ${sessions.length} → ${userMap.size}\n`);

    process.exit(0);

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main();
