// The package's core types, as it declares them (types/<name>.avsc), checked
// with the engine: each a valid schema, named by its package, documented
// throughout; examples of a request on its way, as plain JSON, valid as
// them, the same after AVRO and back; a carrier with its value, a variant
// of its base. No runtime is started: the modules' functions checked
// against the types.
import test from '../../modules/node_modules/brittle/index.js'
import fs, { readFileSync, readdirSync, mkdtempSync, rmSync } from '../../modules/node_modules/bare-fs/index.js'
import { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { typeOf, valid, readAs, is, uriOf, partsOf, primitiveOf } from '../../modules/pear-full-square/mycelium-avro/index.js'
import { avro } from '../../modules/pear-full-square/mycelium-value/index.js'
import { asked, filled, understood, noted, measured, returned, FLAGS, NONE } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import { typesOf } from '../../modules/pear-full-square/mrepo-base-runtime/index.js'
import { p2pgitBackend, writer, openRepo } from '../../modules/pear-full-square/mycelium-git/index.js'

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
const ARRIVED = { command: 'crud/read swarms', from: 'terminal', to: 'local/host', reply: '/haicc/terminal', origin: null, form: null, processing: { log: [], metrics: null, changed: [], waiting: null, sent: null, continuation: null }, returned: null }
const FORM = { protocol: 'crud', action: 'read', uri: ['main', 'swarms'], args: [], flags: { ...NONE, log: 'info' } }
const PROCESSED = {
  log: [{ time: '2026-11-26T10:00:00.120Z', level: 'info', event: 'request.metrics', line: 'Done in 12 ms: 2 reads, 1 select.' }],
  metrics: { ms: 12, reads: 2, selects: 1, puts: 0, removes: 0, commits: 0 },
  changed: [],
  waiting: null,
  sent: null,
  continuation: null
}
const DONE = { ...ARRIVED, form: FORM, processing: PROCESSED, returned: { status: 'done', message: 'Deployed host as local/host, from haiccing/base-component-haicc.\nIts service is started.', attachments: [] } }
const FAILED = { ...ARRIVED, command: 'crud/update swarms', form: { ...FORM, action: 'update' }, processing: { ...PROCESSED, log: [{ time: '2026-11-26T10:00:00.120Z', level: 'error', event: 'request.failed', line: 'Refused at the door: no action crud update.' }] }, returned: { status: 'failed', message: 'Refused here: crud has no action update (create, read, delete).\nTo see what it offers: help/annotate swarms crud', attachments: [] } }

test('the types the package declares: valid schemas, named by the package, documented throughout', (t) => {
  t.alike([record.name, request.name, attachment.name], ['haiccing.basePackageRuntime.record', 'haiccing.basePackageRuntime.request', 'haiccing.basePackageRuntime.attachment'], 'named by its organisation, its package, its name')
  t.alike([RECORD, REQUEST, ATTACHMENT].map(s => uriOf(s.name)), ['haiccing/base-package-runtime/record', 'haiccing/base-package-runtime/request', 'haiccing/base-package-runtime/attachment'], 'each name its URI')
  t.ok([RECORD, REQUEST, ATTACHMENT].every(documented), 'a doc on each and on every field, all the way down')
  // the three essential types, in the package's own structure: what is laid into an mrepo's avro layer as it is deployed
  const laid = name => readFileSync(join(here, '..', '..', 'mrepo', 'avro', 'types', 'haiccing', 'base-package-runtime', `${name}.avsc`))
  t.ok(['record', 'request', 'attachment'].every(n => laid(n).equals(readFileSync(join(here, '..', '..', 'types', `${n}.avsc`)))), 'its mrepo/avro/types: the three, each the bytes of its types/ (one declaration, its copy for the deploy held equal)')
  t.alike(RECORD.fields.map(f => f.name), ['topic', 'key', 'offset', 'timestamp', 'headers'], 'the record: the transport\'s, no value in its base')
  t.alike(REQUEST.fields.map(f => f.name), ['command', 'from', 'to', 'reply', 'origin', 'form', 'processing', 'returned'], 'the request: what was asked and by whom, the form, the processing, what is returned')
  t.alike(ATTACHMENT.fields.map(f => f.name), ['name', 'type', 'content', 'at'], 'the attachment, a wrapper: what it is, its content\'s type, its content as bytes, or where its value is')
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

test('an attachment: a wrapper carrying its content as bytes by the type it names; or pointed to; one fixed type, whatever its content', (t) => {
  // a value into the wrapper: AVRO's binary by its type (mycelium-value), base64 text in JSON and in memory
  const wrap = (name, type, handler, value) => ({ name, type, content: handler.encode(value).toString('base64'), at: null })
  const page = '# deploy\n\nBuilds a child mrepo.\n'
  const text = wrap('The page boot/deploy', 'avro/string', avro(primitiveOf('avro/string')), page)
  t.alike(valid(attachment, text), { valid: true }, 'a text, a type of AVRO\'s own by its URI: valid as the attachment')
  t.is(avro(primitiveOf('avro/string')).decode(Buffer.from(text.content, 'base64')), page, 'its content read by the type its URI names: the value')
  t.alike(plain(readAs(attachment, attachment, text)), text, 'through AVRO and back, the same: bytes there, base64 text here')
  // content of a package's own type: the wrapper the same type, nothing of the content's type needed to check it
  const done = { ...DONE, returned: { status: 'done', message: 'Done.', attachments: [] } }
  const whole = wrap('The request as it was done', 'haiccing/base-package-runtime/request', avro(request), done)
  t.alike(valid(attachment, whole), { valid: true }, 'a record as content: the same wrapper, valid by the attachment type alone')
  t.alike(plain(avro(request).decode(Buffer.from(whole.content, 'base64'))), done, 'read by the type it names: the value')
  const pointed = { name: 'The request log of local/host', type: 'haiccing/base-package-runtime/request', content: null, at: 'local/host/request/done' }
  t.alike(valid(attachment, pointed), { valid: true }, 'pointed to: no content, where its value is')
  t.alike(valid(attachment, { name: 'a', type: 'avro/string' }), { valid: true }, 'neither written: none, by default')
  t.absent(valid(attachment, { ...text, content: 'not base64!' }).valid, 'content that is no base64: not an attachment')
  t.absent(valid(attachment, { ...text, value: page }).valid, 'strict: no value beside it, no variant of it')
  const answered = { ...DONE, returned: { status: 'done', message: 'The page boot/deploy, attached.', attachments: [text, pointed] } }
  t.alike(valid(request, answered), { valid: true }, 'a request with its attachments, one carried, one pointed to: checked whole')
  t.alike(plain(readAs(request, request, answered)), answered, 'through AVRO and back, the same')
})

test('the flags: a field of the type each flag there is, by its declaration; one that stands alone a boolean, one that takes a value a text', (t) => {
  const fields = REQUEST.fields.find(f => f.name === 'form').type[1].fields.find(f => f.name === 'flags').type.fields
  t.alike(fields.map(f => f.name).sort(), Object.keys(FLAGS).sort(), 'every flag declared a field, every field a flag declared')
  for (const f of fields) t.alike([f.type, f.default], FLAGS[f.name].values === null ? ['boolean', false] : [['null', 'string'], null], `${f.name}: its type and what it is when not written`)
  t.alike(valid(request, { ...ARRIVED, form: { ...FORM, flags: { ...NONE, nope: true } } }), { valid: false, problems: [{ at: 'form/flags', expected: 'haiccing.basePackageRuntime.requestFlags' }] }, 'a flag there is none of: not a request')
  t.alike(valid(request, { ...ARRIVED, form: { ...FORM, flags: { ...NONE, help: 'yes' } } }).valid, false, 'a value of another type: not a request')
})

test('what the request module makes is the request: each step of its way valid as the type, the same after AVRO and back', (t) => {
  const protocols = { crud: { default: 'read', actions: { read: { uris: ['**'] } } } }
  const a = asked('crud/read swarms --flags log=debug', { from: 'terminal', to: 'local/host', reply: '/haicc/terminal' })
  const u = understood(a, protocols, ['main'])
  const n = measured(noted(u, 'info', 'request.metrics', 'Done in 12 ms: 2 reads, 1 select.'), { ms: 12, reads: 2, selects: 1 })
  const d = returned(n, 'done', 'Two nodes at swarms.', [{ name: 'The request log of local/host', type: 'haiccing/base-package-runtime/request', at: 'local/host/request/done' }, { name: 'A text', type: 'avro/string', content: avro(primitiveOf('avro/string')).encode('said').toString('base64') }])
  const f = returned(n, 'failed', 'Refused here: crud has no action update.')
  const given = filled({ protocol: 'crud', action: 'read', uri: ['main', '.'], args: [1], flags: { help: true } }, { from: 'local/host', origin: 1795482773435 })
  for (const [what, r] of [['asked', a], ['understood', u], ['noted and measured', n], ['returned done, an attachment', d], ['returned failed', f], ['a form filled in', given]]) {
    t.alike(valid(request, r), { valid: true }, `${what}: valid as the request, strictly`)
    t.alike(plain(readAs(request, request, r)), r, `${what}: through AVRO and back, the same`)
  }
})

test('what a runtime checks by: the package\'s three essential types in an mrepo\'s avro layer, as its deploy lays them in; a request checked by its name', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'runtime-types-'))
  try {
    // an mrepo's avro layer as the package's structure gives it: mrepo/avro, its config and its types
    const backend = p2pgitBackend(join(dir, '.git'), { fs })
    await backend.init()
    const w = writer(backend)
    await w.createLayer('avro', 'Create avro', { author: { name: 'test', email: 'test@localhost' } })
    const c = await w.change('avro')
    const part = join(here, '..', '..', 'mrepo', 'avro')
    await c.put('/.layer.json', readFileSync(join(part, '.layer.json')))
    for (const f of readdirSync(join(part, 'types', 'haiccing', 'base-package-runtime'))) await c.put(`/types/haiccing/base-package-runtime/${f}`, readFileSync(join(part, 'types', 'haiccing', 'base-package-runtime', f)))
    await c.commit('Its types', { author: { name: 'test', email: 'test@localhost' } })
    const types = await typesOf(openRepo(backend))
    t.alike(types.held, ['haiccing/base-package-runtime/attachment', 'haiccing/base-package-runtime/record', 'haiccing/base-package-runtime/request'], 'held: the three essential types, by URI')
    t.is(types.type('haiccing/base-package-runtime/request').name, request.name, 'the request, by its URI; the attachment it names made with it')
    t.alike(types.valid('haiccing/base-package-runtime/request', DONE), { valid: true }, 'a request checked by the mrepo\'s own layer')
    t.alike(types.valid('haiccing/base-package-runtime/request', { ...DONE, output: 1 }).valid, false, 'strictly')
    t.alike(types.valid('haiccing/base-package-runtime/record', { topic: '/local/host/inbox', key: null, offset: 1, timestamp: '2026-11-26T10:00:00.000Z', headers: {} }), { valid: true }, 'the record, by its URI')
    t.exception(() => types.type('haiccing/base-package-crud/node'), /type not held: haiccing\/base-package-crud\/node/, 'a type of another package: not held, refused, said')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

