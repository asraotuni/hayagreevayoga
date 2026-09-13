const authMounts = document.querySelectorAll("[data-auth-mount]");

for (const mount of authMounts) {
  mount.innerHTML = '<button class="auth-button" type="button">Sign in</button>';
}

const dialog = document.createElement("dialog");
dialog.className = "auth-dialog";
dialog.innerHTML = `
  <form class="auth-card" method="dialog">
    <button class="auth-close" value="cancel" aria-label="Close sign in">×</button>
    <p class="auth-kicker">HAYAGREEVA</p>
    <h2>Sign in to your profile</h2>
    <p id="auth-message" class="auth-message">Use Google or receive a one-time code by email.</p>
    <button id="google-sign-in" class="google-button" type="button"><span aria-hidden="true">G</span> Continue with Google</button>
    <p class="auth-divider"><span>or</span></p>
    <label for="auth-email">Email address</label>
    <input id="auth-email" type="email" autocomplete="email" placeholder="you@example.com" required>
    <button id="email-code-request" class="auth-primary" type="button">Email me a code</button>
    <div id="otp-fields" hidden>
      <label for="auth-code">One-time code</label>
      <input id="auth-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" placeholder="6-digit code">
      <button id="email-code-confirm" class="auth-primary" type="button">Verify and sign in</button>
    </div>
    <p class="auth-small">Mobile sign-in will be added later.</p>
  </form>`;
document.body.append(dialog);

const message = dialog.querySelector("#auth-message");
const email = dialog.querySelector("#auth-email");
const otpFields = dialog.querySelector("#otp-fields");
const code = dialog.querySelector("#auth-code");
let auth;

function setMessage(text, error = false) {
  message.textContent = text;
  message.dataset.error = String(error);
}

async function loadAuth() {
  if (auth) return auth;
  const response = await fetch("/amplify_outputs.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Authentication is not configured for this environment yet.");
  const config = await response.json();
  const [{ Amplify }, methods] = await Promise.all([
    import("https://esm.sh/aws-amplify@6"),
    import("https://esm.sh/aws-amplify@6/auth"),
  ]);
  Amplify.configure(config);
  auth = methods;
  return auth;
}

async function refreshProfile() {
  try {
    const client = await loadAuth();
    const user = await client.getCurrentUser();
    const attributes = await client.fetchUserAttributes();
    const label = attributes.given_name || user.username || "Profile";
    for (const mount of authMounts) {
      mount.innerHTML = `<button class="auth-button" type="button" data-profile>${label}</button>`;
    }
    document.querySelectorAll("[data-profile]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (confirm("Sign out of your profile?")) {
          await client.signOut();
          location.reload();
        }
      });
    });
  } catch {
    // A missing config or no current session simply leaves the Sign in button.
  }
}

authMounts.forEach((mount) => {
  mount.addEventListener("click", () => {
    setMessage("Use Google or receive a one-time code by email.");
    dialog.showModal();
  });
});

dialog.querySelector("#google-sign-in").addEventListener("click", async () => {
  try {
    setMessage("Opening Google sign in…");
    const client = await loadAuth();
    await client.signInWithRedirect({ provider: "Google" });
  } catch (error) {
    setMessage(error.message || "Google sign in is unavailable.", true);
  }
});

dialog.querySelector("#email-code-request").addEventListener("click", async () => {
  if (!email.reportValidity()) return;
  try {
    setMessage("Sending your one-time code…");
    const client = await loadAuth();
    const result = await client.signIn({
      username: email.value.trim(),
      options: { authFlowType: "USER_AUTH", preferredChallenge: "EMAIL_OTP" },
    });
    if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
      otpFields.hidden = false;
      code.focus();
      setMessage("Check your email for a six-digit code.");
    } else if (result.isSignedIn) {
      dialog.close();
      await refreshProfile();
    } else {
      setMessage("Unable to start email sign in. Please try again.", true);
    }
  } catch (error) {
    setMessage(error.message || "Unable to send a code.", true);
  }
});

dialog.querySelector("#email-code-confirm").addEventListener("click", async () => {
  if (!code.reportValidity()) return;
  try {
    setMessage("Verifying your code…");
    const client = await loadAuth();
    const result = await client.confirmSignIn({ challengeResponse: code.value.trim() });
    if (result.isSignedIn) {
      dialog.close();
      await refreshProfile();
    } else {
      setMessage("That code could not complete sign in. Please request a new code.", true);
    }
  } catch (error) {
    setMessage(error.message || "That code is invalid or has expired.", true);
  }
});

refreshProfile();
