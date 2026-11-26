# start/

The runtime as an mrepo's process, end to end, in a temporary folder removed after.

Entry: `run.js`; the test: `start.test.js`.

## Steps

- An mrepo written from the runtime package's part of the structure
  alone: its layers on the filesystem storage, its boot hooks, no package
  linked. The schema registry where the install has it: the package's
  types mounted as the warm boot mounts them.
- The runtime started (`bare run.js --work=<folder>`; `RUNTIME`: a bundle
  to test instead, the release check): running, its status over its local
  connection.
- Its boot hooks placed as its own requests as it started, each done
  before anything is taken in. With no package linked, the protocols they
  name are not there, and each says so: nothing is active.
- The proof of the request structure: a request dropped in its inbox
  folder, its line as typed, for a protocol that is loaded and not
  active: the same request back in its outbox, a record around it,
  returned `failed`, why said in words; the same in `request/done`. For
  a protocol it does not have, a flag there is none of, a field its
  type does not have: each refused, said.
- Asked to stop: its process ends.

Leaves nothing running.
