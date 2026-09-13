const form = document.querySelector("#profile-form");
const status = document.querySelector("#profile-status");
const fields = Object.fromEntries([...form.querySelectorAll("input, textarea")].map((field) => [field.id, field]));
let auth;

async function getAuth() {
  if (auth) return auth;
  const config = await (await fetch("/amplify_outputs.json", { cache: "no-store" })).json();
  const [{ Amplify }, methods] = await Promise.all([import("https://esm.sh/aws-amplify@6"), import("https://esm.sh/aws-amplify@6/auth"), import("https://esm.sh/aws-amplify@6/auth/enable-oauth-listener")]);
  Amplify.configure(config); auth = methods; return auth;
}
function setValues(attributes) {
  fields["profile-first-name"].value = attributes.given_name || ""; fields["profile-last-name"].value = attributes.family_name || ""; fields["profile-dob"].value = attributes.birthdate || ""; fields["profile-email"].value = attributes.email || ""; fields["profile-mobile"].value = attributes.phone_number || ""; fields["profile-address"].value = attributes.address || ""; fields["profile-country"].value = attributes["custom:country"] || "India"; fields["profile-state"].value = attributes["custom:state"] || ""; fields["profile-pin"].value = attributes["custom:pin_code"] || "";
}
try { const client = await getAuth(); await client.getCurrentUser(); setValues(await client.fetchUserAttributes()); form.hidden = false; status.hidden = true; } catch { status.textContent = "Sign in to view and update your profile."; }
form.addEventListener("submit", async (event) => { event.preventDefault(); if (!form.reportValidity()) return; status.hidden = false; status.textContent = "Saving your profile…"; try { const values = { given_name: fields["profile-first-name"].value.trim(), family_name: fields["profile-last-name"].value.trim(), "custom:country": fields["profile-country"].value.trim() || "India" }; [["birthdate", "profile-dob"], ["phone_number", "profile-mobile"], ["address", "profile-address"], ["custom:state", "profile-state"], ["custom:pin_code", "profile-pin"]].forEach(([name, id]) => { if (fields[id].value.trim()) values[name] = fields[id].value.trim(); }); await (await getAuth()).updateUserAttributes({ userAttributes: values }); status.textContent = "Profile saved. Your details will prefill matching service forms."; } catch (error) { status.textContent = error.message || "Unable to save profile."; } });
