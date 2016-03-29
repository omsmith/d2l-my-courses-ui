# my-courses-widget

The UI for the My Courses homepage widget in the LE.

## Building

Install dependencies via NPM:

```shell
npm install
```

Build application assets to the `dist` directory:

```shell
npm run build
```

## Running Locally

To run the application locally, run the following from within the project:

```shell
npm run serve
```

This will:
- build the application into the dist folder
- start a local server using polyserve

The demo app can be visited at:
> http://localhost:8080/components/my-courses-widget/demo/index.html

## Unit Tests

The unit tests are built and run using [web-component-tester](https://github.com/Polymer/web-component-tester) which must be installed prior to running the tests (may require `sudo`).

```
npm install -g web-component-tester
```

To run unit tests and perform linting, run:

```shell
npm test
```

## Publishing & Releasing

To publish a numbered "release" version, follow steps below.

### Bump version ###

```BASH
$ # npm help 1 version
$ # npm help 7 semver
$ npm version [major|minor|patch|premajor|preminor|prepatch|prerelease] -m "chore(version) bump %s"
$ git push upstream master
$ git push upstream master --tags
```

## Contributing
Contributions are welcome, please submit a pull request!

### Code Style

This repository is configured with [EditorConfig](http://editorconfig.org) rules and
contributions should make use of them.
