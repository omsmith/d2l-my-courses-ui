# d2l-my-courses-ui

The UI for the My Courses homepage widget in the LE.

## Components

`d2l-my-courses` is made up of several web components all working together. The
intent behind this design is that each component can be used more or less
independently. If there is a need, these components could be broken out into
their own repositories/release schedule, but for now they are all contained
within this repo.

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
> http://localhost:8080/components/d2l-my-courses/demo/index.html

## `user-info-api` Integration

The My Courses widget pulls data from an instance of the User Info Service to
get the enrollments for a user. This is intended as a temporary solution, and
will be changed in the future.

## Local Testing

Testing from within LMS:

1) Checkout brightspace/d2l-my-courses-ui and brightspace/brightspace-integration

2) In brightspace-integration project, ensure you're in the correct branch (c12i12)

3) In d2l-my-courses-ui directory, run

```shell
bower link
```
to allow it to be linked from brightspace-integration

4) In brightspace-integration directory, run

```shell
bower link d2l-my-courses-ui
```
to link to the local d2l-my-courses-ui project

5) Build and run brightspace-integration (will have to be rebuilt on any changes to d2l-my-courses-ui)

Under Windows, you will likely also run into a problem in brightspace-integration
where web-component-shards will fail due to the 'tmp' directory not being able
to be deleted, preventing 'npm run serve' from succeeding. A simple workaround
is to run the contents of the npm 'serve' script directly after building, and
removing the tmp directory manually.

## Unit Tests

The unit tests are built and run using [web-component-tester](https://github.com/Polymer/web-component-tester).

To lint and run unit tests, run:

```shell
npm test
```

## Publishing & Releasing

To publish a numbered "release" version, follow steps below.

```BASH
$ # npm help 1 version
$ # npm help 7 semver
$ git checkout master
$ git pull
$ npm version [major|minor|patch|premajor|preminor|prepatch|prerelease] -m "chore(version) bump %s"
$ git push origin master --tags
```

## Contributing
Contributions are welcome, please submit a pull request!

> Note: To contribute, please create a branch in this repo instead of a fork.
We are using [Sauce Labs](https://saucelabs.com/) in our CI builds which don't
work in PRs from forks. Thanks!

### Code Style

This repository is configured with [EditorConfig](http://editorconfig.org) rules and
contributions should make use of them.
