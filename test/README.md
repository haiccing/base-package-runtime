# test/

The runtime package's tests: two of its own, `start` and `types`, and the generic ones, a folder each.

## Links

- [start](start/)
- [types](types/)
- [info](info/)
- [code](code/)
- [mrepo](mrepo/)
- [package](package/)
- [modules](modules/)
- [info-in-situ](info-in-situ/)
- [mrepo-in-situ](mrepo-in-situ/)

## Sets

| set | tests |
|---|---|
| `validate` | `start`, `types`, `info`, `code`, `mrepo`, `package` |
| `validate-in-situ` | `types`, `info-in-situ`, `mrepo-in-situ`: run in a running mrepo with `runtime run`; what the platform runs to check the package where it is installed |
| `full` | `start`, `types`, `info`, `code`, `mrepo`, `package`, `modules` |
