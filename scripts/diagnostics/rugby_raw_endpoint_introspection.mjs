import fs from 'node:fs/promises';

const GQL = 'https://rugby-au-cms.graphcdn.app/';
const OUT = 'docs/diagnostics/raw-backfill-introspection.json';

const query = `query RawBackfillIntrospection {
  __schema {
    queryType {
      fields {
        name
        args { name type { kind name ofType { kind name ofType { kind name } } } }
        type { kind name ofType { kind name ofType { kind name } } }
      }
    }
    types {
      kind
      name
      fields {
        name
        args { name type { kind name ofType { kind name ofType { kind name } } } }
        type { kind name ofType { kind name ofType { kind name } } }
      }
    }
  }
}`;

const r = await fetch(GQL, {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json', 'user-agent': 'Mozilla/5.0' },
  body: JSON.stringify({ operationName: 'RawBackfillIntrospection', query, variables: {} }),
});
const text = await r.text();
let json;
try { json = JSON.parse(text); } catch { throw new Error(`non-json ${r.status}: ${text.slice(0,500)}`); }
const fields = json?.data?.__schema?.queryType?.fields || [];
const types = json?.data?.__schema?.types || [];
const candidates = fields.filter(f => /fixture|result|match|season|competition/i.test(f.name) || (f.args || []).some(a => /fixture|match|season|year|comp|team|date/i.test(a.name)));
const candidateTypeNames = new Set();
for (const f of candidates) {
  let t = f.type;
  while (t) { if (t.name) candidateTypeNames.add(t.name); t = t.ofType; }
}
const candidateTypes = types.filter(t => candidateTypeNames.has(t.name) || /fixture|match|result/i.test(t.name || '')).map(t => ({
  kind: t.kind,
  name: t.name,
  fields: (t.fields || []).map(f => ({ name: f.name, args: f.args, type: f.type }))
}));
const out = { status: r.status, errors: json?.errors || [], candidates, candidateTypes, capturedAt: new Date().toISOString() };
await fs.mkdir('docs/diagnostics', { recursive: true });
await fs.writeFile(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify({status:r.status,candidateCount:candidates.length,candidates:candidates.map(x=>({name:x.name,args:(x.args||[]).map(a=>a.name),type:x.type})),candidateTypeNames:[...candidateTypeNames]}, null, 2));
