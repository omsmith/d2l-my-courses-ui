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
npm run resolver
```

This will:
- build the application with an `appconfig.json` specific for local builds
- start a local app resolver
- start a local web server to host your application

The app resolver can be visited at:
> http://localhost:3000/resolve/urn%3Ad2l%3Afra%3Aclass%3Amy-courses-widget

The application's `appconfig.json` can be viewed at:
> http://localhost:3000/app/appconfig.json

The application can be viewed from within Brightspace by creating a homepage that includes this widget.

## Unit Tests

```shell
npm test
```

View full code coverage report at `{project dir}/coverage/{browser}/lcov-report/index.html`

## Contributing
Contributions are welcome, please submit a pull request!

### Code Style

This repository is configured with [EditorConfig](http://editorconfig.org) rules and
contributions should make use of them.
