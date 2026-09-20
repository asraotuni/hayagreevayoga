import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (await readFile(new URL('../profile/profile.js', import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '');
const html = await readFile(new URL('../profile/index.html', import.meta.url), 'utf8');
async function setup(profile, fail = false) {
  const fields = Object.fromEntries([...html.matchAll(/<input id="([^"]+)"/g)].map(([,id]) => [id,{id,value:''}]));
  const button = {}, status = {}, listeners = {}, calls = [], navigations = [];
  const form = { hidden:true, querySelectorAll:() => Object.values(fields), querySelector:() => button, reportValidity:() => true, addEventListener:(type,fn) => listeners[type] = fn };
  const document = { querySelector:selector => selector === '#profile-form' ? form : status, addEventListener:() => {} };
  const client = {getCurrentUser:async()=>({userId:'test-user'}),fetchUserAttributes:async()=>({given_name:'Google',family_name:'Name',email:'test@example.com'})};
  const request = async (auth,config,data) => { calls.push(data); if(fail) throw Error('Unavailable'); return profile; };
  const localStorage = {getItem:() => JSON.stringify({address:'Old line 1\nOld line 2\nOld line 3',phone:'00123',birthdate:'2000-01-01'})};
  await new (Object.getPrototypeOf(async function(){}).constructor)('document','loadAuth','loadConfig','profileRequest','localStorage','location',source)(document,async()=>client,async()=>({}),request,localStorage,{assign:url=>navigations.push(url)});
  return {fields,form,status,listeners,calls,navigations};
}
test('cloud profile takes precedence and Save excludes admin flags and identity', async()=>{
  const ui = await setup({firstName:'Cloud',lastName:'User',addressLine1:'Cloud street',addressLine2:'',addressLine3:'',mobile:'0099',pin:'012345',yogaTherapy:true});
  assert.equal(ui.fields['profile-first-name'].value,'Cloud');
  assert.equal(ui.fields['profile-address-line1'].value,'Cloud street');
  await ui.listeners.submit({preventDefault(){}});
  const saved = ui.calls[1];
  assert.equal(saved.pin,'012345');
  for(const key of ['uuid','email','yogaTherapy','classicalMusic','astrology']) assert.equal(Object.hasOwn(saved,key),false);
  assert.deepEqual(ui.navigations,['/']);
});
test('new cloud profile prefills legacy address for explicit migration', async()=>{
  const ui = await setup(null);
  assert.equal(ui.fields['profile-address-line1'].value,'Old line 1');
  assert.equal(ui.fields['profile-address-line3'].value,'Old line 3');
  assert.equal(ui.fields['profile-mobile'].value,'00123');
  assert.equal(ui.calls.length,1,'loading must not auto-save');
});
test('failed cloud read blocks editing and cannot overwrite saved data', async()=>{
  const ui = await setup(null,true);
  assert.equal(ui.form.hidden,true);
  await ui.listeners.submit({preventDefault(){}});
  assert.equal(ui.calls.length,1);
  assert.equal(ui.status.textContent,'Unavailable');
});
