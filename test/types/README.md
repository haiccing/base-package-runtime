# test/types/

The package's core types checked with the engine, and examples of a request against them.

The types are in [types/](../../types/): the record, the request, the
attachment. No runtime code is run here: they are declared, and the
runtime is brought to them step by step.

## What it checks

- **The types**: each a valid schema, named by its package, its name its
  URI, a `doc` on it and on every field all the way down; no `json`
  type, every field of a concrete type.
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
- **Through the schema registry**: the package's types mounted as the
  warm boot mounts them, at their URIs in the registry's own position; a
  request and a record checked by their names, the runtime's one way to
  a type (`mrepo-base-runtime`, `internal/registry`).
- **Strict**: a field a type does not name is refused, at any depth: a
  request of today's shape, its `output` beside its form, is not one.
- **The record, the transport**: a stream's record with its value a
  variant of the base; the base reads it, its value skipped; the request
  out of its envelope whole.
- **An attachment**: a set of rows and a text, each valid with its value
  as its type; read as the base; pointed to, its base alone; a request
  whose attachment is stored apart.

## In situ

In the `validate-in-situ` set too: run where the package is deployed
(`runtime/run . packages/haiccing/base-package-runtime/test/validate-in-situ`),
it checks the types the running mrepo's own copy of the package
carries. It writes nothing.

## Not here

The runtime writing these: today's records are another shape. The
variant in use at a position, composed here by the test: the `avro`
layer's, when it is there.
