// A blank password on edit means keep the existing credentials.
export function staffPassword(data, isEditing) {
  const password = data.loginPassword || data.password;
  return password?.trim() ? password : (isEditing ? undefined : 'password');
}
