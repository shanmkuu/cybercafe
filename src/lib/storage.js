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

export async function ensureBucketExists(bucket) {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) throw listError;

    const bucketExists = buckets.some(b => b.name === bucket);

    if (!bucketExists) {
      console.log(`Bucket '${bucket}' not found. Attempting to create...`);
      const { data, error: createError } = await supabase.storage.createBucket(bucket, {
        public: false, // Private bucket by default
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: null // Allow all types
      });

      if (createError) throw createError;
      console.log(`Bucket '${bucket}' created successfully.`);
      return { data, error: null };
    }

    return { data: { message: 'Bucket exists' }, error: null };
  } catch (error) {
    console.error('ensureBucketExists error', error);
    return { data: null, error };
  }
}
