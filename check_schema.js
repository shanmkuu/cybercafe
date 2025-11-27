const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mrnnjohrkoypvgisubdf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybm5qb2hya295cHZnaXN1YmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Njc5NzQsImV4cCI6MjA3NzI0Mzk3NH0.jOgD7rdmyETDyZmMF5qSi2PwLRAGEq5lzGgjMcWa5oM'
);

async function checkSchema() {
  try {
    // Get all tables and their schemas
    const { data, error } = await supabase.from('information_schema.tables').select('*').eq('table_schema', 'public');
    console.log('Tables:', data?.map(t => t.table_name) || 'Error:', error);

    // Try to get sessions table columns
    const { data: cols, error: colErr } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'sessions');
    
    if (cols) {
      console.log('\nSessions table columns:');
      cols.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('Error getting columns:', colErr);
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
}

checkSchema();
