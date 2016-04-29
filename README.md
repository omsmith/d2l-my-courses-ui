# my-courses-widget

The UI for the My Courses homepage widget in the LE.

## Building

Install dependencies via NPM:

```shell
npm install
```

## Running Locally

To run the application locally, run the following from within the project:

```shell
npm run serve
```

This will start a local server using polyserve

The demo app can be visited at:
> http://localhost:8080/components/my-courses-widget/demo/index.html

## `user-info-api` Integration

The My Courses widget pulls data from an instance of the User Info Service to get the enrollments for a user. This functionality is currently in a beta-ish state, as doing so more cleanly would require the widget to be running hosted on the LMS. As it stands now, some changes are required to the LMS to enable CORS headers on all requests for this approach to work.

## Local Testing

Testing from within LMS:

1) Checkout brightspace/my-courses-widget and brightspace/brightspace-integration
2) In brightspace-integration project, ensure you're in the correct branch (c12i12)
3) In my-courses-widget directory, run 'bower link' to allow it to be linked from brightspace-integration
4) In brightspace-integration directory, run 'bower link my-courses-widget' to link to local my-courses-widget project
5) Build and run brightspace-integration (will have to be rebuilt on any changes to my-courses-widget)

Note: On Windows, there exists an issue with relative paths, which will prevent web-component-shards from completing successfully without modifying vulcanize to not use path.posix. See: https://github.com/Polymer/vulcanize/issues/338

Under Windows, uou will likely also run into a problem in brightspace-integration where web-component-shards will fail due to the 'tmp' directory not being able to be deleted, preventing 'npm run serve' from succeeding. A simple workaround is to run the contents of the npm 'serve' script directly after building, and removing the tmp directory manually.

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
