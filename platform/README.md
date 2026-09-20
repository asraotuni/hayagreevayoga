# Platform infrastructure

`amplify/backend.ts` installs `dynamodb/resource.js` into the `platform-profiles` stack. It creates a profiles table keyed by the string `uuid`, with on-demand billing, encryption and retention on stack deletion/replacement. Point-in-time recovery is disabled for both dev and prod. Production also enables deletion protection. Table names are explicitly `hayagreeva-dev` and `hayagreeva-prod`, selected from the Amplify branch. Each name must be unique within its AWS account and region; only one stack should own each table.

## Record contract

`dynamodb/profile.schema.json` documents the application record shape. DynamoDB enforces the primary key only; future write handlers must validate the remaining fields, including UUID/email formats. All fields are present; unused address lines or unprovided optional contact values can be empty strings. Mobile and PIN remain strings to preserve leading zeros and international formatting. Service flags use `true` (yes) and `false` (no). These flags are reserved for admin-managed service access; user profile forms must not edit them, and future profile write APIs must reject user attempts to change them.

Example (fictional):

```json
{
  "uuid": "a77a7d8e-b230-4a80-91b7-183a48372121",
  "firstName": "Example",
  "lastName": "User",
  "email": "example@example.com",
  "mobile": "+919000000000",
  "addressLine1": "Example address",
  "addressLine2": "",
  "addressLine3": "",
  "country": "India",
  "state": "Karnataka",
  "pin": "560037",
  "yogaTherapy": true,
  "classicalMusic": false,
  "astrology": false
}
```

For signed-in users, use the verified Cognito token's `sub` as `uuid` within that environment. Do not accept a browser-supplied owner ID for authenticated writes. Production and development have separate user pools, so a person's UUID can differ between environments. The authenticated GET/PUT `/profile` API in `amplify/profiles/` retrieves and saves the signed-in user’s record. UUID and email come from the verified ID token. Only editable fields are accepted; service flags default to false on creation and are preserved on updates. The Lambda has only GetItem/UpdateItem permissions on this environment’s table; browsers receive no DynamoDB permissions.

The Profile page reads DynamoDB before allowing edits. If no record exists, existing browser-local values prefill the form and migrate on explicit Save. A failed read does not fall back to an editable stale profile. Names now save to DynamoDB; Cognito/Google names serve only as initial defaults. Optional `birthdate` preserves the existing Profile date-of-birth field across devices. Saved profiles also prefill service forms after login. API configuration is published at `custom.profiles.endpoint`; deployment is required before the form can save.

## Dev and prod

Use the same repository with two fullstack Amplify branches: `dev` and `prod`. The existing `amplify.yml` deploys the backend and generates frontend outputs using `AWS_BRANCH` and `AWS_APP_ID`, so each branch has its own site, Cognito pool, payment-reference API/table and profiles table. Do not configure either branch to reuse the other's backend or copy generated `amplify_outputs.json` between them.

`environment.js` accepts only `dev` and `prod` for hosted builds. Local Amplify sandboxes without `AWS_BRANCH` default to dev policies and the name `hayagreeva-dev`; deploy them in a separate AWS account or region to avoid colliding with the hosted dev table. QA is not configured.

Deployment setup (not performed by adding these files):

1. Keep the existing `dev` GitHub branch connected to Amplify. Create a `prod` GitHub branch from a reviewed release and connect it as a second fullstack Amplify branch.
2. Configure `AUTH_REDIRECT_URLS` separately per branch with that environment's site URL. Configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for both branch backends. Register each resulting Cognito `/oauth2/idpresponse` callback in its Google OAuth client.
3. Deploy each branch with the checked-in `amplify.yml`. Map the production domain to `prod` when ready; use a separate URL for dev. The existing domain is not reassigned by this code.
4. Find `hayagreeva-dev` or `hayagreeva-prod` in each branch's `platform-profiles` CloudFormation stack. Keep production records separate from development data.

The external Google appointment schedule and payment destination are currently shared code values. Separate AWS resources do not create a second Google calendar or bank account. Use a test calendar/payment configuration for dev if real booking/payment testing is needed.

Verify locally with `npm test` (including synthesized dev/prod table assertions) and `npm run build`.

Reference: [Amplify fullstack branch deployments](https://docs.amplify.aws/swift/deploy-and-host/amplify-hosting/branch-deployments/).
