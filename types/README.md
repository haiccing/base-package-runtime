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
- **Inside `request`**: `requestForm`, `requestProcessing`, `logEntry`,
  `requestMetrics`, `requestChange`, `requestWaiting`,
  `requestContinuation`, `requestReturned`, each named here.
- **The record's `headers`**: a map of texts today; to become a tree
  with metadata at its leaves, a record's journey among them
  (`base-docs-vision`, "Type system").
- **Declared, not yet written with**: the runtime writes today's JSON
  records; these are what it is brought to.
