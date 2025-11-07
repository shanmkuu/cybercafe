import { supabase } from './supabase';

/**
 * Storage helpers
 * - uploadFile(bucket, path, file)
 * - downloadFile(bucket, path)
 * - deleteFile(bucket, path)
 */

export async function uploadFile(bucket, path, file, options = {}) {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, options);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('uploadFile error', error);
    return { data: null, error };
  }
}

export async function downloadFile(bucket, path) {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('downloadFile error', error);
    return { data: null, error };
  }
}

export async function deleteFile(bucket, path) {
  try {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('deleteFile error', error);
    return { data: null, error };
  }
}
