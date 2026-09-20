import { loadAuth, loadConfig } from "../auth/auth-client.js?v=ddb-1";
import { profileRequest } from "./api.js?v=ddb-1";
const form = document.querySelector("#profile-form");
const status = document.querySelector("#profile-status");
const fields = Object.fromEntries([...form.querySelectorAll("input, textarea")].map((field) => [field.id, field]));
let loaded = false, loadedUserId, loadVersion = 0;
function setValues(attributes, saved = {}) {
  // Preserve addresses saved before the form had separate address lines.
  const legacyLines = typeof saved.address === "string" ? saved.address.split(/\r?\n/) : [];
  fields["profile-first-name"].value = saved.firstName ?? attributes.given_name ?? "";
  fields["profile-last-name"].value = saved.lastName ?? attributes.family_name ?? "";
  fields["profile-dob"].value = saved.birthdate || "";
  fields["profile-email"].value = attributes.email || "";
  fields["profile-mobile"].value = saved.mobile ?? saved.phone ?? "";
  fields["profile-address-line1"].value = saved.addressLine1 ?? legacyLines[0] ?? "";
  fields["profile-address-line2"].value = saved.addressLine2 ?? legacyLines[1] ?? "";
  fields["profile-address-line3"].value = saved.addressLine3 ?? legacyLines.slice(2).join(", ");
  fields["profile-country"].value = saved.country || "India";
  fields["profile-state"].value = saved.state || "";
  fields["profile-pin"].value = saved.pin || "";
}
async function loadProfile() {
  const version = ++loadVersion;
  loaded = false;
  form.hidden = true;
  status.hidden = false;
  try {
    const client = await loadAuth();
    const user = await client.getCurrentUser();
    const profile = await profileRequest(client, await loadConfig());
    let saved = profile;
    if (!saved) {
      try { saved = JSON.parse(localStorage.getItem(`hayagreeva-profile-${user.userId}`) || "{}"); } catch { saved = {}; }
    }
    const attributes = await client.fetchUserAttributes();
    if (version !== loadVersion) return;
    setValues(attributes, saved || {});
    loadedUserId = user.userId;
    loaded = true;
    form.hidden = false;
    status.hidden = true;
  } catch (error) { if (version === loadVersion) status.textContent = error.message || "Unable to load profile. Please reload to retry."; }
}
document.addEventListener("hayagreeva-auth-changed", event => {
  if (!loaded || event.detail?.userId !== loadedUserId) loadProfile();
});
await loadProfile();
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!loaded || !form.reportValidity()) return;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  status.hidden = false;
  status.textContent = "Saving your profile…";
  const ids = { firstName: "first-name", lastName: "last-name", birthdate: "dob", mobile: "mobile", addressLine1: "address-line1", addressLine2: "address-line2", addressLine3: "address-line3", country: "country", state: "state", pin: "pin" };
  const data = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, fields[`profile-${id}`].value.trim()]));
  try {
    await profileRequest(await loadAuth(), await loadConfig(), data);
    location.assign("/");
  } catch (error) { status.textContent = error.message || "Unable to save profile. Please retry."; }
  finally { button.disabled = false; }
});
