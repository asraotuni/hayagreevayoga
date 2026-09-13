const form = document.querySelector("#profile-form");
const status = document.querySelector("#profile-status");
const fields = Object.fromEntries([...form.querySelectorAll("input, textarea")].map((field) => [field.id, field]));
let auth, profileKey;

async function getAuth() {
  if (auth) return auth;
  const config = await (await fetch("/amplify_outputs.json", { cache: "no-store" })).json();
  const [{ Amplify }, methods] = await Promise.all([import("https://esm.sh/aws-amplify@6"), import("https://esm.sh/aws-amplify@6/auth"), import("https://esm.sh/aws-amplify@6/auth/enable-oauth-listener")]);
  Amplify.configure(config); auth = methods; return auth;
}
function setValues(attributes, saved = {}) {
  fields["profile-first-name"].value = attributes.given_name || ""; fields["profile-last-name"].value = attributes.family_name || ""; fields["profile-dob"].value = saved.birthdate || ""; fields["profile-email"].value = attributes.email || ""; fields["profile-mobile"].value = saved.phone || ""; fields["profile-address"].value = saved.address || ""; fields["profile-country"].value = saved.country || "India"; fields["profile-state"].value = saved.state || ""; fields["profile-pin"].value = saved.pin || "";
}
try { const client = await getAuth(), user = await client.getCurrentUser(); profileKey = `hayagreeva-profile-${user.userId}`; setValues(await client.fetchUserAttributes(), JSON.parse(localStorage.getItem(profileKey) || "{}")); form.hidden = false; status.hidden = true; } catch { status.textContent = "Sign in to view and update your profile."; }
form.addEventListener("submit", async (event) => { event.preventDefault(); if (!form.reportValidity()) return; status.hidden = false; status.textContent = "Saving your profile…"; try { await (await getAuth()).updateUserAttributes({ userAttributes: { given_name: fields["profile-first-name"].value.trim(), family_name: fields["profile-last-name"].value.trim() } }); localStorage.setItem(profileKey, JSON.stringify({ birthdate: fields["profile-dob"].value, phone: fields["profile-mobile"].value.trim(), address: fields["profile-address"].value.trim(), country: fields["profile-country"].value.trim() || "India", state: fields["profile-state"].value.trim(), pin: fields["profile-pin"].value.trim() })); status.textContent = "Profile saved. Your details will prefill matching service forms on this browser."; } catch (error) { status.textContent = error.message || "Unable to save profile."; } });
