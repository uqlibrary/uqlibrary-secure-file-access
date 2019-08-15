# uqlibrary-ga

[![Codeship Status for uqlibrary/uqlibrary-ga](https://app.codeship.com/projects/e042adf0-0679-0137-c6b1-26c1dc1e6e4a/status?branch=polymer1.0)](https://codeship.com/projects/325642)
[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-ga.svg)](https://david-dm.org/uqlibrary/uqlibrary-ga)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-ga/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-ga?type=dev)

Web component for Google Analytics.

* Full documentation can be found at [GitHub Pages](http://uqlibrary.github.io/uqlibrary-ga/uqlibrary-ga/).

## GA Usage

```html
<uqlibrary-ga tracking-id='UA-1234-5' website-url='http://www.test.com/app' app-name='TestApp' cookie-domain='test.com'></uqlibrary-ga>
```

Tracking id, website-url, app-name are set to be replaced at build time or as attributes to a required value.
At build time use following tokens to replace:

* `<GA-TRACKING-ID>`
* `<GA-WEBSITE-URL>`
* `<GA-COOKIE-DOMAIN>`

## uqlibrary-gtm

Web component for Google Tag Manager

### GTM Usage

```html
<uqlibrary-gtm container-id='GTM-1234-5' app-name='TestApp'></uqlibrary-gtm>
```

Container id, app name are set to be replaced at build time or as attributes to a required value.
At build time use following tokens to replace:

* `<GTM-CONTAINER-ID>`

## Getting Started

Please, note `.bowerrc` installs dependencies to the parent directory of the git root. It's recommended to develop this component in a sub directory, eg  `.development/uqlibrary-ga-dev/uqlibrary-ga/` not to pollute your development directory with all bower dependencies.

Install Node.JS and run the following:

```sh
npm install -g bower web-component-tester polymer-cli
npm install
bower install
```

## Developing

* Please adhere to the Polymer code style guide provided at [Style Guide](http://polymerelements.github.io/style-guide/).
* GitHub pages should be updated after every commit to `polymer1.0` branch by running `bin/generate-gh-pages.sh`.
* The full property rundown can be viewed locally by running `npm start`.

## Testing

Tests are run using the Web Component Tester:

```sh
npm test
```
