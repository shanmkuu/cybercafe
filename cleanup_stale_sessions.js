/**
 * Cleanup script for stale sessions
 * Safely closes sessions that have been idle for more than 12 hours
 * 
 * Usage:
 *   node cleanup_stale_sessions.js          # interactive confirmation
 *   node cleanup_stale_sessions.js --dry-run # show count without modifying
 *   node cleanup_stale_sessions.js --force   # skip confirmation (use carefully)
 */

import { supabase } from './src/lib/supabase.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force');

  console.log('\n=== Stale Sessions Cleanup ===\n');

  try {
    // Step 1: Count stale sessions
    console.log('Checking for stale sessions (inactive for 12+ hours)...');
    const { data: staleCount, error: countError } = await supabase
      .rpc('count_stale_sessions', { hours_threshold: 12 })
      .catch(async () => {
        // Fallback if RPC doesn't exist: use direct query
        const threshold = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('sessions')
          .select('id', { count: 'exact', head: true })
          .is('ended_at', null)
          .lt('started_at', threshold);
        return { data: data?.length || 0, error };
      });

    if (countError) {
      console.error('Error counting stale sessions:', countError);
      process.exit(1);
    }

    const count = staleCount?.count || staleCount || 0;
    console.log(`Found ${count} stale session(s)\n`);

    if (count === 0) {
      console.log('✓ No stale sessions to clean up.');
      process.exit(0);
    }

    if (isDryRun) {
      console.log('(Dry-run mode: no changes made)');
      process.exit(0);
    }

    // Step 2: Get confirmation (unless --force)
    if (!isForce) {
      const confirm = await question(
        `⚠️  This will close ${count} stale session(s). Continue? (yes/no): `
      );
      if (confirm.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    // Step 3: Close stale sessions
    console.log('\nClosing stale sessions...');
    const threshold = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        event: 'logout'
      })
      .is('ended_at', null)
      .lt('started_at', threshold);

    if (updateError) {
      console.error('Error closing sessions:', updateError);
      process.exit(1);
    }

    console.log(`✓ Successfully closed ${count} stale session(s)`);
    console.log('Cleanup complete.\n');
    process.exit(0);

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
