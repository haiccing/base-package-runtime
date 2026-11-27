// The runtime as an mrepo's process: bare run.js --work=<folder>, over an
// mrepo on the filesystem storage written here (its layers, no service);
// started, its protocols registered, answering through its inbox, stopped.
// The proof of the request structure in the runtime alone: a request in
// (a record around it, checked by the package's types in the mrepo's own
// avro layer), the same request out, returned. And what stops a runtime: a
// boot hook that fails, its essential types not held.
import test from '../../modules/node_modules/brittle/index.js'
import process from '../../modules/node_modules/bare-process/index.js'
import { spawn, spawnSync } from '../../modules/node_modules/bare-subprocess/index.js'
import fs, { mkdtempSync, rmSync, writeFileSync, mkdirSync, readdirSync, readFileSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import os, { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { openRepo, writer, p2pgitBackend } from '../../modules/pear-full-square/mycelium-git/index.js'
import { asked, drop, nameOf, layer, gitdirOf, viewOf, NONE } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import { ask, booted, whyFailed } from '../../modules/pear-full-square/mrepo-base-runtime/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const alive = pid => spawnSync('kill', ['-0', String(pid)], { stdio: 'ignore' }).status === 0
const author = { name: 'test', email: 'test@localhost' }

// An mrepo from the runtime package's part of the structure alone: its
// layers, no package linked, nothing preloaded. No boot hook: the package's
// own (mrepo/runtime/hooks/boot.haicc) activates protocols of packages that
// are not linked here. hook: a boot hook file's text, for the test of one;
// avro: false, without its avro layer.
async function mrepo (work, { hook = null, avro = true } = {}) {
  const gitdir = gitdirOf(work, 'test')
  mkdirSync(gitdir, { recursive: true })
  const backend = p2pgitBackend(gitdir, { fs })
  await backend.init()
  const w = writer(backend)
  for (const l of ['main', 'runtime', 'protocols', 'inbox', 'outbox', 'request/pending/default', 'request/execute', 'request/done']) await w.createLayer(l, `Create ${l}`, { author })
  // each layer's own config, the package's (mrepo/<layer>/.layer.json): a
  // streaming layer's structure declared there
  for (const l of ['inbox', 'outbox', 'request/done']) {
    const c = await w.change(l)
    await c.put('/.layer.json', readFileSync(join(pkg, 'mrepo', l, '.layer.json')))
    await c.commit('Its config', { author })
  }
  if (hook !== null) {
    const r = await w.change('runtime')
    await r.put('/hooks/boot.haicc', Buffer.from(hook))
    await r.commit('Its boot hook file', { author })
  }
  mkdirSync(join(viewOf(work, 'test'), 'inbox'), { recursive: true })
  writeFileSync(join(work, 'mrepo.json'), JSON.stringify({ storage: 'filesystem', name: 'test' }))
  // its avro layer, as the package's structure gives it (mrepo/avro): its
  // config and the three essential types, what the runtime checks by
  if (!avro) return backend
  await w.createLayer('avro', 'Create avro', { author })
  const a = await w.change('avro')
  await a.put('/.layer.json', readFileSync(join(pkg, 'mrepo', 'avro', '.layer.json')))
  const held = join(pkg, 'mrepo', 'avro', 'types', 'haiccing', 'base-package-runtime')
  for (const f of readdirSync(held)) await a.put(`/types/haiccing/base-package-runtime/${f}`, readFileSync(join(held, f)))
  await a.commit('Its essential types', { author })
  return backend
}

// A request dropped in its inbox as anyone drops one, the line as typed;
// its record back from the outbox, under the offset it arrived with.
async function send (work, backend, line, more = {}) {
  const offset = drop(viewOf(work, 'test'), 'test', { ...asked(line, { from: 'terminal', to: 'test', reply: '/terminal' }), ...more })
  const repo = openRepo(backend)
  for (let i = 0; i < 100; i++) {
    const back = await layer({ repo: repo }, 'outbox').read(nameOf(offset)).then(r => r, () => null)
    if (back) return { offset, back }
    await wait(100)
  }
  return { offset, back: null }
}

test('the runtime: started, answering, stopped', { timeout: 60000 }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'runtime-'))
  try {
    const backend = await mrepo(work)
    // RUNTIME: the bundle to test instead of this folder's run.js (the release check)
    const entry = process.env.RUNTIME || join(pkg, 'run.js')
    const child = spawn(os.execPath(), [entry, `--work=${work}`], { stdio: 'ignore' })
    let s = null
    for (let i = 0; i < 100 && !s; i++) { s = await ask({ work, op: 'status' }); if (!s) await wait(100) }
    t.alike(s?.repository, { name: 'test', uri: 'test', storage: 'filesystem', id: null, key: null }, 'running: the mrepo, on the filesystem; no unique URI of its own: its name')
    t.alike(await booted({ work }), { state: 'none' }, 'no boot hook here: none to wait for')
    // As it started: the protocol protocol opened by the runtime itself, its
    // own request. This mrepo is the runtime package's part alone: it links
    // no package, so the protocol protocol is not there, and it says so.
    const repo = openRepo(backend)
    let done = []
    for (let i = 0; i < 100 && done.length < 1; i++) {
      done = []
      for (const n of await layer({ repo }, 'request/done').list()) done.push((await layer({ repo }, 'request/done').read(n)).value)
      if (done.length < 1) await wait(100)
    }
    t.alike(done.map(r => r.command), ['protocol/activate . protocol'], 'the runtime\'s own: a request of its own, done')
    t.ok(done.every(r => r.returned.status === 'failed' && /^Refused, nothing run\.\nno protocol: protocol \(/.test(r.returned.message)), 'not possible here: no package linked, said')
    t.alike(done.map(r => [r.from, r.to, r.reply]), [['test', 'test', null]], 'the mrepo\'s own: from and to itself, nobody waiting')
    t.alike(await repo.select('/protocols/*'), [], 'so nothing is active')
    // The proof. Through its inbox: a request in, the same request out,
    // returned failed: nothing is active by default, said in words.
    const line = 'runtime/run . packages/haiccing/x/test/validate --flags log=debug'
    const { offset, back } = await send(work, backend, line)
    t.alike([back.topic, back.key, back.offset, back.headers], ['/outbox', null, offset, {}], 'back in its outbox: a record around it, under the offset it arrived with')
    t.alike(back.value, {
      command: line,
      from: 'terminal',
      to: 'test',
      reply: '/terminal',
      origin: null,
      form: { protocol: 'runtime', action: 'run', uri: ['main', '.'], args: ['packages/haiccing/x/test/validate'], flags: { ...NONE, log: 'debug' } },
      processing: { log: [], metrics: back.value.processing.metrics, changed: [], waiting: null, sent: null, continuation: null },
      returned: { status: 'failed', message: 'Refused, nothing run.\nnot now: runtime run (runtime is not active)', attachments: [] }
    }, 'the same request: its line as typed, who asked; its form as understood, its flags each its type; returned failed, why said: loaded, not active')
    t.alike(back.value.processing.log, [], 'refused: nothing run, nothing in its log; why is what is returned, said once')
    t.alike(Object.keys(back.value.processing.metrics), ['ms', 'reads', 'selects', 'puts', 'removes', 'commits'], 'and its metrics')
    const kept = await layer({ repo }, 'request/done').read(nameOf(offset))
    t.alike([kept.topic, kept.offset, kept.value], ['/request/done', offset, back.value], 'the same in request/done')
    t.is((await send(work, backend, 'crud/read .')).back.value.returned.message, 'Refused, nothing run.\nno protocol: crud ()', 'a protocol it does not have: refused at the door, said with the active ones (none)')
    t.is((await send(work, backend, 'runtime/run . x --flags nope')).back.value.returned.message, 'Not run: its flags.\nno flag: nope (container, feedback, help, layer, log, physical)', 'a flag there is none of: not run, said')
    // by its types, the mrepo's own, strict
    t.is((await send(work, backend, 'runtime/run . x', { more: 1 })).back.value.returned.message, 'Refused, nothing run.\nnot a request (haiccing/base-package-runtime/request): ., expected haiccing.basePackageRuntime.request', 'a field its type does not have: not a request, refused at the inbox')
    t.ok((await ask({ work, op: 'stop' }))?.stopping, 'asked to stop')
    for (let i = 0; i < 100 && alive(child.pid); i++) await wait(100)
    t.absent(alive(child.pid), 'its process ended')
  } finally { rmSync(work, { recursive: true, force: true }) }
})

test('its boot hook failing: the runtime bails out: nothing taken in, why said beside its repository, its process ended, exit 1', { timeout: 60000 }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'runtime-bail-'))
  try {
    const backend = await mrepo(work, { hook: '# boot\nprotocol/activate . help\nprotocol/activate . info\n' })
    const entry = process.env.RUNTIME || join(pkg, 'run.js')
    const child = spawn(os.execPath(), [entry, `--work=${work}`], { stdio: 'ignore' })
    const code = await new Promise(resolve => child.on('exit', resolve))
    t.is(code, 1, 'its process ended by itself, exit 1')
    t.is(await ask({ work, op: 'status' }), null, 'no runtime answering')
    const why = whyFailed({ repo: viewOf(work, 'test') })
    t.ok(/^line 2: protocol\/activate \. help: Refused, nothing run\.\nno protocol: protocol \(/.test(why), `why, in its folder (runtime.failed): the line that failed and what it said: ${why?.split('\n')[0]}`)
    const done = []
    const repo = openRepo(backend)
    for (const n of await layer({ repo }, 'request/done').list()) done.push((await layer({ repo }, 'request/done').read(n)).value.command)
    t.alike(done.sort(), ['protocol/activate . help', 'protocol/activate . protocol'], 'its hook stopped at the line that failed: the next not run')
    t.alike(await booted({ work }), { state: 'failed', error: why }, 'booted(), what waits on a boot hook: failed, with why')
  } finally { rmSync(work, { recursive: true, force: true }) }
})

test('its essential types not held: a runtime on an mrepo with no avro layer takes nothing in, said with which', { timeout: 60000 }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'runtime-untyped-'))
  try {
    const backend = await mrepo(work, { avro: false })
    const entry = process.env.RUNTIME || join(pkg, 'run.js')
    const child = spawn(os.execPath(), [entry, `--work=${work}`], { stdio: 'ignore' })
    let s = null
    for (let i = 0; i < 100 && !s; i++) { s = await ask({ work, op: 'status' }); if (!s) await wait(100) }
    t.ok(s?.pid, 'running')
    const { back } = await send(work, backend, 'runtime/run . x')
    t.alike(back?.value.returned, { status: 'failed', message: 'Refused, nothing run.\nits types are not held here: haiccing/base-package-runtime/record, haiccing/base-package-runtime/request (the mrepo\'s avro layer; nothing is taken in without them)', attachments: [] }, 'a request in: refused, said with the types it does not hold')
    t.ok((await ask({ work, op: 'stop' }))?.stopping, 'asked to stop')
    for (let i = 0; i < 100 && alive(child.pid); i++) await wait(100)
    t.absent(alive(child.pid), 'its process ended')
  } finally { rmSync(work, { recursive: true, force: true }) }
})
