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

## `user-info-api` Integration

The My Courses widget pulls data from an instance of the User Info Service to get the enrollments for a user. This functionality is currently in a beta-ish state, as doing so more cleanly would require the widget to be running hosted on the LMS. As it stands now, some changes are required to the LMS to enable CORS headers on all requests for this approach to work.

## Unit Tests

The unit tests are built and run using [web-component-tester](https://github.com/Polymer/web-component-tester).

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

> Note: To contribute, please create a branch in this repo instead of a fork. We are using [Sauce Labs](https://saucelabs.com/) in our CI builds which don't work in PRs from forks. Thanks!

### Code Style

This repository is configured with [EditorConfig](http://editorconfig.org) rules and
contributions should make use of them.
