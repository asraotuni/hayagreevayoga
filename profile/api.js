export async function profileRequest(client, config, data) {
  const endpoint = config.custom?.profiles?.endpoint;
  if (!endpoint) throw new Error('Profile storage is not configured yet. Please try after deployment.');
  const token = (await client.fetchAuthSession()).tokens?.idToken;
  if (!token) throw new Error('Sign in to view and update your profile.');
  const response = await fetch(`${endpoint}/profile`, {
    method: data === undefined ? 'GET' : 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    cache: 'no-store', signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Unable to access your profile. Please retry.');
  return result.profile;
}
