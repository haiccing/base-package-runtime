# start/

The runtime as an mrepo's process, end to end, in a temporary folder removed after.

Entry: `run.js`; the test: `start.test.js`.

## Steps

- An mrepo written from the runtime package's part of the structure
  alone: its layers on the filesystem storage, no package linked, no
  boot hook (the package's own activates packages not linked here). Its `avro` layer as the package's structure gives it: the
  three essential types, what its runtime checks by.
- The runtime started (`bare run.js --work=<folder>`; `RUNTIME`: a bundle
  to test instead, the release check): running, its status over its local
  connection.
- Its own request as it started (the protocol protocol opened): with no
  package linked it is not there, and it says so: nothing is active.
- The proof of the request structure: a request dropped in its inbox
  folder, its line as typed, for a protocol that is loaded and not
  active: the same request back in its outbox, a record around it,
  returned `failed`, why said in words; the same in `request/done`. For
  a protocol it does not have, a flag there is none of, a field its
  type does not have: each refused, said.
- Asked to stop: its process ends.
- **A boot hook that fails**: an mrepo with a hook whose first line
  cannot run: the runtime bails out, its process ended by itself, exit
  1; why in `runtime.failed` beside its repository, the line that failed
  and what it said; the hook's next line not run; `booted()` says
  failed, with why.
- **Its essential types not held**: an mrepo with no `avro` layer: its
  runtime runs, and a request into its inbox is refused, said with the
  types it does not hold.

Leaves nothing running.
