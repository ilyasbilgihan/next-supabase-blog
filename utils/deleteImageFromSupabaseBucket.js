export default async function deleteImageFromSupabaseBucket(supabase, filePath) {
  const bucket = process.env.NEXT_SUPABASE_BUCKET;

  const { data: list } = await supabase.storage.from(bucket).list(filePath);
  const filesToRemove = list.map((x) => `${filePath}/${x.name}`);
  await supabase.storage.from(bucket).remove(filesToRemove);
}
