// The runtime package deployed, in an install of the test's own: floating,
// away from any platform there is. A work folder in the temporary folder,
// the boot run from the sources (SOURCES: the boot component's bundle and
// the packages'), then this package deployed as a child by a request, as
// the haicc command would. What the package brings to an mrepo checked
// where a deploy put it: its layers, the avro layer with the three
// essential types, a request through its runtime checked by them, its
// validation tests run in it. Its runtimes stopped, the folder removed.
// Skipped without the sources.
import test from '../../modules/node_modules/brittle/index.js'
import process from '../../modules/node_modules/bare-process/index.js'
import { spawnSync } from '../../modules/node_modules/bare-subprocess/index.js'
import fs, { mkdtempSync, rmSync, readFileSync, existsSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname, resolve } from '../../modules/node_modules/bare-path/index.js'
import os, { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { openRepo, p2pgitBackend } from '../../modules/pear-full-square/mycelium-git/index.js'
import { asked, drop, nameOf, layer } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import { ask, viewOf } from '../../modules/pear-full-square/mrepo-base-runtime/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const alive = pid => spawnSync('kill', ['-0', String(pid)], { stdio: 'ignore' }).status === 0
const SOURCES = resolve(process.env.SOURCES || join(pkg, '..', '..', 'sources'))
const BOOT = join(SOURCES, 'haiccing', 'base-component-boot.bundle')
const ME = 'haiccing/base-package-runtime'
const have = existsSync(BOOT) && existsSync(join(SOURCES, `${ME}.bundle`))
const ESSENTIAL = ['attachment', 'record', 'request']

test('the package deployed by a boot of the test\'s own: its avro layer laid in with the three essential types, in every mrepo; a request through its runtime checked by them; its validation tests run in it', { timeout: 240000, skip: !have }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'runtime-deployed-'))
  const boot = viewOf(work, 'boot')
  const child = viewOf(work, 'local/rt')
  const registry = viewOf(work, 'local/avro-registry')
  try {
    const r = spawnSync(os.execPath(), [BOOT, `--work=${work}`, `--sources=folder:${SOURCES}`], { stdio: ['ignore', 'pipe', 'pipe'] })
    t.is(r.status, 0, `the boot, from the sources: done ${r.stderr.toString()}`)
    const repoOf = dir => openRepo(p2pgitBackend(join(dir, '.git'), { fs }))
    // A request as the haicc command drops one, into an mrepo's inbox; its
    // answer read from that mrepo's outbox under its offset.
    const typed = async (dir, uri, line, more = {}, tries = 900) => {
      const offset = drop(dir, uri, { ...asked(line, { from: 'terminal', to: uri, reply: '/haicc/terminal' }), ...more })
      let v = null
      for (let i = 0; i < tries && !v; i++) { v = await layer({ repo: repoOf(dir) }, 'outbox').read(nameOf(offset)).then(x => x.value, () => null); if (!v) await wait(100) }
      return v?.returned ?? null
    }
    const deployed = await typed(boot, 'local/boot', `boot/deploy rt ${ME}`)
    t.alike([deployed?.status, deployed?.message.split('\n')[0]], ['done', `Deployed rt as local/rt, from ${ME}.`], 'deployed as a child, by a request')

    // its avro layer, as the deploy laid it in from the package's structure
    const mine = repoOf(child)
    const held = async repo => Object.fromEntries(await Promise.all((await repo.select('/avro/types/*/*/*')).map(async ([p]) => [p, await repo.read(p)])))
    const types = await held(mine)
    t.alike(Object.keys(types).sort(), ESSENTIAL.map(n => `/avro/types/${ME}/${n}.avsc`), 'its avro layer: the three essential types at their URIs, and no other')
    t.ok(ESSENTIAL.every(n => types[`/avro/types/${ME}/${n}.avsc`].equals(readFileSync(join(pkg, 'types', `${n}.avsc`)))), 'each the bytes of the package\'s types/: one declaration')
    t.alike(JSON.parse((await mine.read('/avro/.layer.json')).toString()).mode, 'non-atomic', 'its config laid in with it: a cache, this machine\'s')
    t.absent(existsSync(join(child, 'avro')), 'no folder of it on disk: read from its repository')
    for (const [name, dir] of [['the boot mrepo', boot], ['the schema registry', registry]]) t.alike(Object.keys(await held(repoOf(dir))).sort(), ESSENTIAL.map(n => `/avro/types/${ME}/${n}.avsc`), `${name}: the same three, as every mrepo this package is in`)

    // a request through its runtime, checked by its own layer
    const s = await ask({ repo: child, op: 'status' })
    t.alike([s?.repository.uri, s?.boot.state], ['local/rt', 'done'], 'its runtime running, its boot hook done')
    const info = await typed(child, 'local/rt', 'info/get')
    t.is(info?.status, 'done', 'a request into its inbox: taken in, done')
    const odd = await typed(child, 'local/rt', 'info/get', { more: 1 })
    t.alike([odd?.status, odd?.message.split('\n')[0], odd?.message.split('\n')[1].split(',')[0]], ['failed', 'Refused, nothing run.', `not a request (${ME}/request): .`], 'one with a field its type does not name: refused at its inbox, strict, by the type it holds')
    // its validation tests, where it is deployed
    const ran = await typed(boot, 'local/boot', `haicc rt runtime/run . packages/${ME}/test/validate-in-situ`)
    t.alike([ran?.status, ran?.message.split('\n')[0]], ['done', `Passed: /test/validate-in-situ of ${ME}, 3 units.`], `its validation tests, run in it: ${ran?.message.split('\n').slice(1, 4).join(' / ')}`)
    const down = await typed(boot, 'local/boot', 'boot/teardown rt')
    t.alike([down?.status, existsSync(child), alive(s.pid)], ['done', false, false], 'torn down: its runtime ended, its folder gone')
  } finally {
    // whatever happened: its runtimes stopped, then its folder removed
    for (const d of [child, registry, boot]) {
      const s = await ask({ repo: d, op: 'status' }).catch(() => null)
      if (!s?.pid) continue
      await ask({ repo: d, op: 'stop' }).catch(() => null)
      for (let i = 0; i < 100 && alive(s.pid); i++) await wait(100)
      if (alive(s.pid)) { try { os.kill(s.pid, 'SIGTERM') } catch {} }
      t.absent(alive(s.pid), `nothing left running: ${d.slice(work.length + 1)}`)
    }
    rmSync(work, { recursive: true, force: true })
  }
})
