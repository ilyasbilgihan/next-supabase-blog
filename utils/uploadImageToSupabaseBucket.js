import { decode } from 'base64-arraybuffer';
import { nanoid } from 'nanoid';

export default async function uploadImageToSupabaseBucket(supabase, image, filePath) {
  const bucket = process.env.NEXT_SUPABASE_BUCKET;
  const contentType = image.match(/data:(.*);base64/)?.[1];
  const base64FileData = image.split('base64,')?.[1];

  if (!['image/jpeg', 'image/png'].includes(contentType) || !base64FileData) {
    throw new Error('Image data not valid');
  }

  // Upload image
  const ext = contentType.split('/')[1];
  const unique = nanoid();
  const path = `${filePath}/${unique}.${ext}`;

  const { data: list } = await supabase.storage.from(bucket).list(filePath);
  const filesToRemove = list.map((x) => `${filePath}/${x.name}`);
  await supabase.storage.from(bucket).remove(filesToRemove);

  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, decode(base64FileData), {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.log(uploadError);
    throw new Error('Unable to upload image to storage');
  }

  // Construct public URL
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;

  return url;
}
