/** Hosted environments are selected by the Amplify branch; local sandboxes use dev. */
export function getEnvironment(branch = process.env.AWS_BRANCH) {
  const environment = branch ?? 'dev';
  if (!['dev', 'prod'].includes(environment)) {
    throw new Error(`Unsupported environment "${environment}". Use the dev or prod branch.`);
  }
  return environment;
}
