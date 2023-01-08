export default async function validate(target, schema) {
  try {
    await schema.validate(target);
  } catch (err) {
    return { error: err.errors.join(', ') };
  }
  return true;
}
