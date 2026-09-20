export const editable = ['firstName', 'lastName', 'mobile', 'addressLine1', 'addressLine2', 'addressLine3', 'country', 'state', 'pin', 'birthdate'];
const flags = ['yogaTherapy', 'classicalMusic', 'astrology'];
export function createHandler(store) {
  return async event => {
    const reply = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
    const claims = event.requestContext?.authorizer?.jwt?.claims;
    if (!claims?.sub || !claims.email || claims.token_use !== 'id' || ![true, 'true'].includes(claims.email_verified)) return reply(401, { message: 'Sign in with a verified email.' });
    const method = event.requestContext?.http?.method;
    try {
      let record;
      if (method === 'GET') record = await store.get(claims.sub);
      else if (method === 'PUT') {
        let input;
        try {
          if (event.isBase64Encoded || Buffer.byteLength(event.body || '') > 8192) throw Error();
          input = JSON.parse(event.body || '');
          if (!input || Array.isArray(input) || typeof input !== 'object' || Object.keys(input).some(key => !editable.includes(key))) throw Error();
          for (const key of editable) {
            if (key === 'birthdate' && input[key] === undefined) continue;
            if (typeof input[key] !== 'string' || input[key].length > (key.startsWith('address') ? 300 : 100)) throw Error();
            input[key] = input[key].trim();
          }
          if (!input.firstName || !input.lastName) throw Error();
          if (input.birthdate && (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthdate) || !Number.isFinite(Date.parse(input.birthdate)) || new Date(input.birthdate).toISOString().slice(0, 10) !== input.birthdate || input.birthdate > new Date().toISOString().slice(0, 10))) throw Error();
        } catch { return reply(400, { message: 'Enter valid profile details. Identity and service access cannot be edited here.' }); }
        record = await store.save(claims.sub, claims.email, input, flags);
      } else return reply(405, { message: 'Method not allowed.' });
      // Do not return admin-managed flags or unrecognized database attributes.
      const profile = record ? Object.fromEntries(['uuid', ...editable].filter(key => record[key] !== undefined).map(key => [key, record[key]])) : null;
      if (profile) profile.email = claims.email;
      return reply(200, { profile });
    } catch { return reply(503, { message: 'Unable to access your saved profile. Please retry.' }); }
  };
}
