import { supabase } from './supabase';

/**
 * Realtime helpers
 * - subscribeToTable: listens to Postgres changes (INSERT/UPDATE/DELETE)
 * - unsubscribe: remove a subscription
 *
 * These use Supabase realtime via 'postgres_changes' channels.
 */

export async function subscribeToTable({ table, schema = 'public', event = '*', filter = null, callback }) {
  if (!table || typeof callback !== 'function') {
    throw new Error('subscribeToTable requires table and callback');
  }

  // build filter object for postgres_changes
  const opts = { event, schema, table };

  // subscribe
  const channel = supabase.channel(`${table}-changes`)
    .on('postgres_changes', opts, (payload) => {
      try {
        callback(null, payload);
      } catch (err) {
        console.error('subscribeToTable callback error', err);
      }
    })
    .on('error', (err) => {
      console.error('Realtime channel error', err);
      try {
        callback(err, null);
      } catch (_) {}
    });

  try {
    await channel.subscribe();
  } catch (err) {
    console.error('Failed to subscribe to realtime channel', err);
    throw err;
  }

  return channel;
}

export async function unsubscribe(channel) {
  try {
    if (!channel) return;
    await supabase.removeChannel(channel);
  } catch (err) {
    console.error('Failed to unsubscribe channel', err);
  }
}
