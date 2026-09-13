import { defineAuth, secret } from "@aws-amplify/backend";

const redirectUrls = (process.env.AUTH_REDIRECT_URLS ?? "http://localhost:8000/")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

export const auth = defineAuth({
  loginWith: {
    email: {
      otpLogin: true,
    },
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        scopes: ["openid", "email", "profile"],
        attributeMapping: {
          email: "email",
          givenName: "given_name",
          familyName: "family_name",
        },
      },
      callbackUrls: redirectUrls,
      logoutUrls: redirectUrls,
    },
  },
  userAttributes: {
    givenName: { mutable: true, required: false },
    familyName: { mutable: true, required: false },
  },
});
