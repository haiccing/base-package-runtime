# types/

The core types the runtime package declares, an AVRO schema each.

| type | |
|---|---|
| `record.avsc` | `haiccing.basePackageRuntime.record`. The transport envelope, as Kafka's: where a record is and when; nothing of what its value means. |
| `request.avsc` | `haiccing.basePackageRuntime.request`. A request, self-contained: what was asked and by whom, as understood, its processing, what is returned. |
| `attachment.avsc` | `haiccing.basePackageRuntime.attachment`. Data that is an answer's product, named by its type. |

Each is the type's base schema, named `<org>.<package>.<name>` in data
names, a `doc` on it and on every field. The same structure in AVRO, in
JS and in JSON: every field of a concrete type, no any
(`base-docs-avro`, "Structure or language").

## Design

- **A carrier's base holds no value**: a stream's record with its value,
  an attachment with its value, is a variant of the base, its value its
  own type's: the stream's (set by where it is), the attachment's (by
  its `type`). The base travels: the transport reads a record and skips
  its value.
- **Inside `request`**: `requestForm`, `requestFlags`, `requestProcessing`, `logEntry`,
  `requestMetrics`, `requestChange`, `requestWaiting`, `requestSent`,
  `requestContinuation`, `requestReturned`, each named here.
- **A form's `uri` is a chain, not one string** (the human, 2026-11-26:
  "to avoid having to parse repeatedly. On our platform URIs cross many
  boundaries and the current root moves a lot. Because we do forward
  visibility only the current root of a URI is important"): a list of
  URIs, each read at the root the ones before it reach. A request
  submitted to an mrepo forgets its path outside it ("it always starts
  with the mrepo layer to begin with. That is then follow by URI local
  root positions, ending in a relative end URI"): the first part the
  layer, read by its place; the last what is asked; between them the
  local root positions, often ending at a link to another mrepo. One
  type throughout: every part a relative URI. Functionality is registered at a root; a part
  carries no field of its own until something acts on one.
- **The record's `headers`**: a map of texts today; to become a tree
  with metadata at its leaves, a record's journey among them
  (`base-docs-vision`, "Type system").
- **Written with**: the request protocol's pass, the execute protocol
  and the runtime write them (JSON documents in the request layers, the
  inbox and the outbox); the inbox checks a record and its request by
  them, asked of the schema registry, strict. The package's `start` test
  is the proof: a request in, the same out.
