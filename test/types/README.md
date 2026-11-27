# test/types/

The package's core types checked with the engine, and examples of a request against them.

The types are in [types/](../../types/): the record, the request, the
attachment. No runtime is started here: the types are declared, the
modules' functions that make and read a request checked against them.

## What it checks

- **The types**: each a valid schema, named by its package, its name its
  URI, a `doc` on it and on every field all the way down; no `json`
  type, every field of a concrete type.
- **Its copy for the deploy**: the three in `mrepo/avro/types/`, each
  the bytes of its `types/`.
- **A request on its way**, as plain JSON: as it arrives (the line as
  typed, who asked), done, failed: valid as the request; through AVRO
  and back, the same structure; what is left out, from its default; a
  returned without a status, an argument that is no text, a log entry
  of today's shape: not valid.
- **What the request module makes**: a request asked, understood,
  noted and measured, returned done or failed, a form filled in
  (`mrepo-base-request`, `lib/request.js`): each valid as the type,
  strictly, the same after AVRO and back. The type is the package's; its
  check of the module's code is here.
- **What a runtime checks by**: an mrepo's `avro` layer as the
  package's structure gives it, the three essential types held; a
  request and a record checked by their names (`mrepo-base-runtime`,
  `internal/types`); a type of another package not held, refused.
- **Strict**: a field a type does not name is refused, at any depth: a
  request of today's shape, its `output` beside its form, is not one.
- **The record, the transport**: a stream's record with its value a
  variant of the base; the base reads it, its value skipped; the request
  out of its envelope whole.
- **An attachment**, the wrapper: a text by one of AVRO's own types and
  a record by a package's type, each its content as bytes by the type it
  names, valid as the one attachment type and read back as the value;
  pointed to, no content; content that is no base64, or a value beside
  it, refused; a request with its attachments checked whole, the same
  after AVRO and back.

## In situ

In the `validate-in-situ` set too: run where the package is deployed
(`runtime/run . packages/haiccing/base-package-runtime/test/validate-in-situ`),
it checks the types the running mrepo's own copy of the package
carries. It writes nothing in the mrepo (a repository in the temporary
folder, removed after).

## Not here

A runtime started and a request through it: the `start` test. An mrepo
deployed, its `avro` layer as the deploy laid it in: the `deployed`
test. The variant in use at a position, composed here by the test: the
`avro` layer's `variants/`, when it is there.
