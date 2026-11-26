// The package's core types, as it declares them (types/<name>.avsc), checked
// with the engine: each a valid schema, named by its package, documented
// throughout; examples of a request on its way, as plain JSON, valid as
// them, the same after AVRO and back; a carrier with its value, a variant
// of its base. No runtime code is run: the types are what it is brought to.
import test from '../../modules/node_modules/brittle/index.js'
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from '../../modules/node_modules/bare-fs/index.js'
import { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { typeOf, valid, readAs, is, uriOf, partsOf } from '../../modules/pear-full-square/mycelium-avro/index.js'
import { asked, filled, understood, noted, measured, returned } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import { registryOf, mountOf } from '../../modules/pear-full-square/mrepo-base-runtime/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const schemaOf = name => JSON.parse(readFileSync(join(here, '..', '..', 'types', `${name}.avsc`), 'utf8'))
const plain = v => JSON.parse(JSON.stringify(v))
// a doc on a type and on every field, all the way down
const documented = s => {
  if (Array.isArray(s)) return s.every(documented)
  if (!s || typeof s !== 'object') return true
  if (s.type === 'array') return documented(s.items)
  if (s.type === 'map') return documented(s.values)
  if (s.type !== 'record') return true
  return Boolean(s.doc) && s.fields.every(f => Boolean(f.doc) && documented(f.type))
}
// The types, loaded as the package declares them: the attachment first,
// the request names it.
const named = {}
const RECORD = schemaOf('record')
const ATTACHMENT = schemaOf('attachment')
const REQUEST = schemaOf('request')
const record = typeOf(RECORD, named)
const attachment = typeOf(ATTACHMENT, named)
const request = typeOf(REQUEST, named)
// A carrier with its value: a variant of its base, the base's fields and
// its value, of the value's own type; named in the value's context, its
// name the base's (the core type).
const carrying = (base, context, value) => typeOf({ ...base, name: `${context}.${partsOf(base.name).type}`, fields: [...base.fields, { name: 'value', type: value, doc: 'its value' }] }, { ...named })

// A request as it arrives, as plain JSON: the line as typed and who asked.
const ARRIVED = { command: 'crud/read swarms', from: 'terminal', to: 'local/host', reply: '/haicc/terminal', origin: null, form: null, processing: { log: [], metrics: null, changed: [], waiting: null, path: [], continuation: null }, returned: null }
const FORM = { protocol: 'crud', action: 'read', uri: ['main', 'swarms'], args: [], flags: { log: 'info' } }
const PROCESSED = {
  log: [{ time: '2026-11-26T10:00:00.120Z', level: 'info', event: 'request.metrics', line: 'Done in 12 ms: 2 reads, 1 select.' }],
  metrics: { ms: 12, reads: 2, selects: 1, puts: 0, removes: 0, commits: 0 },
  changed: [],
  waiting: null,
  path: [],
  continuation: null
}
const DONE = { ...ARRIVED, form: FORM, processing: PROCESSED, returned: { status: 'done', message: 'Deployed host as local/host, from haiccing/base-component-haicc.\nIts service is started.', attachments: [] } }
const FAILED = { ...ARRIVED, command: 'crud/update swarms', form: { ...FORM, action: 'update' }, processing: { ...PROCESSED, log: [{ time: '2026-11-26T10:00:00.120Z', level: 'error', event: 'request.failed', line: 'Refused at the door: no action crud update.' }] }, returned: { status: 'failed', message: 'Refused here: crud has no action update (create, read, delete).\nTo see what it offers: help/annotate swarms crud', attachments: [] } }

test('the types the package declares: valid schemas, named by the package, documented throughout', (t) => {
  t.alike([record.name, request.name, attachment.name], ['haiccing.basePackageRuntime.record', 'haiccing.basePackageRuntime.request', 'haiccing.basePackageRuntime.attachment'], 'named by its organisation, its package, its name')
  t.alike([RECORD, REQUEST, ATTACHMENT].map(s => uriOf(s.name)), ['haiccing/base-package-runtime/record', 'haiccing/base-package-runtime/request', 'haiccing/base-package-runtime/attachment'], 'each name its URI')
  t.ok([RECORD, REQUEST, ATTACHMENT].every(documented), 'a doc on each and on every field, all the way down')
  t.alike(RECORD.fields.map(f => f.name), ['topic', 'key', 'offset', 'timestamp', 'headers'], 'the record: the transport\'s, no value in its base')
  t.alike(REQUEST.fields.map(f => f.name), ['command', 'from', 'to', 'reply', 'origin', 'form', 'processing', 'returned'], 'the request: what was asked and by whom, the form, the processing, what is returned')
  t.alike(ATTACHMENT.fields.map(f => f.name), ['name', 'type', 'at'], 'the attachment: what it is, its type, where; no value in its base')
  t.absent(JSON.stringify([RECORD, REQUEST, ATTACHMENT]).includes('json'), 'no json type, no any: every field of a concrete type')
})

test('a request on its way, as plain JSON: as it arrives, done, failed; the same after AVRO and back', (t) => {
  for (const [what, r] of [['as it arrives', ARRIVED], ['done', DONE], ['failed', FAILED]]) {
    t.alike(valid(request, r), { valid: true }, `${what}: valid as the request`)
    t.alike(plain(readAs(request, request, r)), r, `${what}: through AVRO and back, the same structure`)
  }
  t.alike(valid(request, { command: 'crud/read swarms' }), { valid: true }, 'the line alone: a request')
  t.alike(plain(readAs(request, request, { command: 'crud/read swarms' })), { ...ARRIVED, from: null, to: null, reply: null }, 'what is left out, from its default')
  t.alike(valid(request, { ...DONE, returned: { message: 'no status' } }).problems.map(p => p.at), ['returned/status'], 'a returned with no status: not one, the place said')
  t.alike(valid(request, { ...DONE, form: { ...FORM, args: [1] } }).problems.map(p => p.at), ['form/args/0'], 'an argument that is no text: not one, the place said')
  t.absent(valid(request, { ...DONE, processing: { ...PROCESSED, log: [{ level: 'info', event: 'x', found: 1 }] } }).valid, 'a log entry of today\'s shape, its data beside it and no line: not one')
  t.alike(valid(request, { ...DONE, output: { deployed: 'host' } }).problems, [{ at: '', expected: 'haiccing.basePackageRuntime.request' }], 'strict: a field the request does not name (today\'s output): not one')
  t.alike(valid(request, { ...DONE, returned: { ...DONE.returned, again: true } }).problems.map(p => p.at), ['returned'], 'strict inside too: a field what is returned does not name')
  t.absent(valid(request, { protocol: 'crud', action: 'read', uri: ['main', 'swarms'], args: [], command: 'crud/read swarms', output: [] }).valid, 'a request of today\'s shape, its form and its output beside each other: not one')
})

test('the record, the transport: a stream\'s record with its value a variant of it; the base reads it, its value skipped', (t) => {
  const stream = carrying(RECORD, 'haiccing.basePackageRuntime.request.done', REQUEST.name)
  t.is(stream.name, 'haiccing.basePackageRuntime.request.done.record', 'named by where it is, its name the core type\'s')
  const stored = { topic: '/local/host/request/done', key: null, offset: 1795482773435, timestamp: '2026-11-26T10:00:00.000Z', headers: {}, value: DONE }
  t.alike(valid(stream, stored), { valid: true }, 'a request in its envelope, as plain JSON: valid as the stream\'s record')
  t.alike(plain(readAs(stream, stream, stored)), stored, 'through AVRO and back, the same')
  t.ok(is(stream, record).is, 'is: one core type, record')
  t.alike(plain(readAs(stream, record, stored, { like: false })), { topic: '/local/host/request/done', key: null, offset: 1795482773435, timestamp: '2026-11-26T10:00:00.000Z', headers: {} }, 'read as the base: where it is and when, nothing of its value')
  t.absent(valid(stream, { ...stored, value: { returned: 5 } }).valid, 'a value that is not the stream\'s type: not valid')
  t.absent(valid(record, stored).valid, 'strict: the base alone does not take a value it does not name; it reads one, as a variant\'s')
  t.alike(plain(readAs(request, request, stored.value)), DONE, 'the request out of its envelope: whole, on its own')
})

test('an attachment: data that is the product, named by its type; its value its type\'s; pointed to, its base alone', (t) => {
  // a set of rows of one shape, its row type declared by the action's package
  const NODE = { type: 'record', name: 'haiccing.basePackageCrud.node', doc: 'A node read', fields: [{ name: 'uri', type: { type: 'array', items: 'string' }, doc: 'its segments' }, { name: 'children', type: { type: 'array', items: 'string' }, default: [], doc: 'its children, by name' }] }
  // what the system loads a type by: its name, its URI
  const types = { 'haiccing/base-package-crud/nodes': { type: 'array', items: NODE }, string: 'string' }
  const rows = { name: 'The nodes at swarms', type: 'haiccing/base-package-crud/nodes', at: null, value: [{ uri: ['main', 'swarms'], children: ['swarm-1'] }, { uri: ['main', 'swarms', 'swarm-1'], children: [] }] }
  const text = { name: 'The page boot/deploy', type: 'string', at: null, value: '# deploy\n\nBuilds a child mrepo.\n' }
  const pointed = { name: 'The request log of local/host', type: 'haiccing/base-package-crud/nodes', at: 'local/host/request/done' }
  for (const [what, a] of [['a set of rows', rows], ['a text', text]]) {
    const whole = carrying(ATTACHMENT, a.type === 'string' ? 'text' : 'haiccing.basePackageCrud.nodes', types[a.type])
    t.alike(valid(whole, a), { valid: true }, `${what}: valid, its value as its type`)
    t.alike(plain(readAs(whole, whole, a)), a, `${what}: through AVRO and back, the same`)
    t.alike(plain(readAs(whole, attachment, a, { like: false })), { name: a.name, type: a.type, at: null }, `${what}: read as the base, what it is and its type`)
  }
  t.absent(valid(carrying(ATTACHMENT, 'haiccing.basePackageCrud.nodes', types[rows.type]), { ...rows, value: [{ uri: 'not segments' }] }).valid, 'a value that is not its type\'s: not valid')
  t.alike(valid(attachment, pointed), { valid: true }, 'pointed to: its base alone, where its value is')
  const answered = { ...DONE, returned: { status: 'done', message: 'Two nodes at swarms.', attachments: [{ name: rows.name, type: rows.type, at: 'local/host/attachments/1795482773435/0' }] } }
  t.alike(valid(request, answered), { valid: true }, 'a request with an attachment, its value stored apart')
  t.alike(plain(readAs(request, request, answered)), answered, 'through AVRO and back, the same')
})

test('what the request module makes is the request: each step of its way valid as the type, the same after AVRO and back', (t) => {
  const protocols = { crud: { default: 'read', actions: { read: { uris: ['**'] } } } }
  const a = asked('crud/read swarms --flags log=debug', { from: 'terminal', to: 'local/host', reply: '/haicc/terminal' })
  const u = understood(a, protocols, ['main'])
  const n = measured(noted(u, 'info', 'request.metrics', 'Done in 12 ms: 2 reads, 1 select.'), { ms: 12, reads: 2, selects: 1 })
  const d = returned(n, 'done', 'Two nodes at swarms.', [{ name: 'The nodes at swarms', type: 'haiccing/base-package-crud/nodes', at: 'local/host/attachments/1795482773435/0' }])
  const f = returned(n, 'failed', 'Refused here: crud has no action update.')
  const given = filled({ protocol: 'crud', action: 'read', uri: ['main', '.'], args: [1], flags: { help: true } }, { from: 'local/host', origin: 1795482773435 })
  for (const [what, r] of [['asked', a], ['understood', u], ['noted and measured', n], ['returned done, an attachment', d], ['returned failed', f], ['a form filled in', given]]) {
    t.alike(valid(request, r), { valid: true }, `${what}: valid as the request, strictly`)
    t.alike(plain(readAs(request, request, r)), r, `${what}: through AVRO and back, the same`)
  }
})

test('through the schema registry, the runtime\'s one way to a type: the package\'s types mounted as the warm boot mounts them, a request checked by its name', (t) => {
  const work = mkdtempSync(join(tmpdir(), 'runtime-registry-'))
  try {
    // mounted as the warm boot does: each type's file, its bytes, at its URI
    const mine = join(mountOf(work), 'haiccing', 'base-package-runtime')
    mkdirSync(mine, { recursive: true })
    for (const f of readdirSync(join(here, '..', '..', 'types')).filter(n => n.endsWith('.avsc'))) copyFileSync(join(here, '..', '..', 'types', f), join(mine, f))
    const reg = registryOf(work)
    t.is(reg.type('haiccing/base-package-runtime/request').name, request.name, 'the request, by its URI; the attachment it names read with it')
    t.alike(reg.valid('haiccing/base-package-runtime/request', DONE), { valid: true }, 'a request checked through the registry')
    t.alike(reg.valid('haiccing/base-package-runtime/request', { ...DONE, output: 1 }).valid, false, 'strictly')
    t.alike(reg.valid('haiccing/base-package-runtime/record', { topic: '/local/host/inbox', key: null, offset: 1, timestamp: '2026-11-26T10:00:00.000Z', headers: {} }), { valid: true }, 'the record, by its URI')
  } finally { rmSync(work, { recursive: true, force: true }) }
})

