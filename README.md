# d2l-my-courses-ui

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
> http://localhost:8080/components/d2l-my-courses/demo/index.html

## Components

`d2l-my-courses` is made up of several web components all working together. The
intent behind this design is that each component can be used more or less
independently. If there is a need, these components could be broken out into
their own repositories/release schedule, but for now they are all contained
within this repo.

### d2l-alert

The `d2l-alert` is intended to be used for highlighted blocks of informational
text.

Properties:

- `visible`: Defines whether alert is visible. Can be a truthy value, or a
function that returns a truthy value.

Demo:
> http://localhost:8080/components/d2l-my-courses/demo/d2l-alert-demo.html

### d2l-simple-overlay

The `d2l-simple-overlay` is a popover window that can be used to display any
content. It uses [iron-overlay](https://github.com/PolymerElements/iron-overlay-behavior)
and various [neon](https://elements.polymer-project.org/browse?package=neon-elements)
behaviours and elements. The overlay supports using different animations
and transitions for desktop and mobile.

Properties:

- `title` _String_: Title that appears at the top of the overlay
- `animationConfig` _function_: Defines transformations for open/close
animations. See the `neon` docs for more information.

Demo:
> http://localhost:8080/components/d2l-my-courses/demo/d2l-simple-overlay-demo.html

### d2l-all-courses

The `d2l-all-courses` component uses the `d2l-simple-overlay` to display a
user's pinned and unpinned courses.

Properties:

- `pinnedCoursesEntities` _Object_: entities representing pinned courses
- `enrollmentsUrl` _String_: URL to use to fetch enrollments
- `allEnrollmentsEntities` _Object_ (optional): if these enrollment entities
are present, no request will be done to fetch all of a user's enrollments

Demo:
> http://localhost:8080/components/d2l-my-courses/demo/d2l-all-courses-demo.html

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

To publish a numbered "release" version, use the "Draft a new release" tool on GitHub.

## Contributing
Contributions are welcome, please submit a pull request!

> Note: To contribute, please create a branch in this repo instead of a fork.
We are using [Sauce Labs](https://saucelabs.com/) in our CI builds which don't
work in PRs from forks. Thanks!

### Code Style

This repository is configured with [EditorConfig](http://editorconfig.org) rules and
contributions should make use of them.
