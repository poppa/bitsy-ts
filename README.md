# bitsy-ts

This is an implementation of [Bitsy][1] in Typescript.

> Bitsy aims to be the best language to implement when writing your first
> compiler or interpreter. It is a resource for programmers learning about
> language design.

## Install

Simply run `yarn` in this directory

## Run

To run a specific Bitsy file:

```
yarn bitsy samples/fibonacci.bitsy
```

for example.

To run all _spec_ files, run

```
yarn spec
```

Three specs will fail since no `float` to `int` conversion is handled atm.

[1]: https://github.com/apbendi/bitsyspec/blob/master/BITSY.md
