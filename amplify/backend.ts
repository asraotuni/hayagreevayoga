import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";

const backend = defineBackend({ auth });
const { cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources;

// Cognito requires PASSWORD to remain an allowed first factor. The frontend
// only requests EMAIL_OTP, so the portal remains passwordless. SMS OTP is
// deliberately absent until mobile sign-in is introduced.
cfnUserPool.addPropertyOverride(
  "Policies.SignInPolicy.AllowedFirstAuthFactors",
  ["PASSWORD", "EMAIL_OTP"],
);
cfnUserPoolClient.explicitAuthFlows = [
  "ALLOW_REFRESH_TOKEN_AUTH",
  "ALLOW_USER_AUTH",
];
