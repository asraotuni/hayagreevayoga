import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";

const backend = defineBackend({ auth });
const { cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources;

// Enable passwordless email OTP through Cognito's USER_AUTH flow. SMS OTP is
// deliberately absent until mobile sign-in is introduced.
cfnUserPool.addPropertyOverride(
  "Policies.SignInPolicy.AllowedFirstAuthFactors",
  ["EMAIL_OTP"],
);
cfnUserPoolClient.explicitAuthFlows = [
  "ALLOW_REFRESH_TOKEN_AUTH",
  "ALLOW_USER_AUTH",
];
