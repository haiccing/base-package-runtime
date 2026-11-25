# test-in-situ

A package's tests run inside a running mrepo, against the mrepo as it is deployed.

`runtime/run` runs a linked package's entry through its dispatcher, in
the mrepo's own runtime: the in-situ tests read the mrepo's info, its
layers and its packages as they are.

## Steps

The script, [steps.haicc](steps.haicc): each line as typed after `haicc`, what it answers under it; run with `howto/run`, shown here at info extraction.

## Notes

- **A unit a line** in the request's log; the result whole in its
  output.
- **A documented package is not run** (the docs mrepo's beyond its
  list): refused.
