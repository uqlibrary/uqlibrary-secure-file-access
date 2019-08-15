# uqlibrary-secure-file-access

[![Codeship Status for uqlibrary/uqlibrary-secure-file-access](https://app.codeship.com/projects/dc175520-07f0-0137-e23c-1e449f82c326/status?branch=polymer1.0)](https://app.codeship.com/projects/325955)
[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access.svg)](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access?type=dev)

uqlibrary-secure-file-access provides logged in access to files stored on AWS

For documentation and demo, please see [GitHub Pages](http://uqlibrary.github.io/uqlibrary-secure-file-access/uqlibrary-secure-file-access/).

This component is called from `collection.html` in uqlibrary-pages to show a copyright acknowledgement page before viewing eg a pdf file stored in s3 at `uql_secure_files` on AWS

## Getting Started

Install Node.JS and run the following:

```sh
npm install -g bower web-component-tester polymer-cli
npm install
bower install
```

## Developing

- Please adhere to the Polymer code style guide provided at [Style Guide](http://polymerelements.github.io/style-guide/).
- Colors and common styles are imported (bower install) from [uqlibrary-styles](http://github.com/uqlibrary/uqlibrary-styles).
- A preview of the component can be viewed locally by running `npm start`. Use the second URL from the command output.
- GitHub pages should be updated after every commit to `master` branch by running `bin/generate-gh-pages.sh`.

## Testing

Tests are run using the Web Component Tester.

```sh
npm test
```
