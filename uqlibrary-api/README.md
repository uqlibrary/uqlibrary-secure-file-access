# uqlibrary-api

[![Codeship Status for uqlibrary/uqlibrary-api](https://app.codeship.com/projects/f19bd6a0-f6b4-0136-b568-56b1a4204b31/status?branch=polymer1.0)](https://codeship.com/projects/321067)
[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-api.svg)](https://david-dm.org/uqlibrary/uqlibrary-api)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-api/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-api?type=dev)

Web components for UQ Library API. See [component page](http://uqlibrary.github.io/uqlibrary-api/uqlibrary-api/) for more information.

## Configuration

uqlibrary-api elements can be used with live API and with mock data.

To use mock data set cookie value UQLMockData to true

```javascript
//add a cookie to indicate usage of mock data
document.cookie="UQLMockData=enabled";
```

To update user type, set the cookie value of UQLMockData-PType to required value. Default value is 1 for internal undergraduate.

```javascript
//required ptype value
document.cookie="UQLMockData-PType=18";
```

### Mock files

Mock files contain data in json format in same format as live API file names should be created based on API call with method `_get` / `_post` / `_delete`. For example:

* API path to `/account/facilities_bookings` mock file should be `/mock/account/facilities_bookings_get.json`.
* API path to `/facilities_availability` mock file should be `/mock/facilities_availability_get.json`

## API Documentation

* API Docs in GitHub pages need to regenerated after every commit to the `polymer1.0` branch by running `bin/generate-gh-pages.sh`. This updates the `gh-pages` branch.
* The docs can be viewed locally by running `npm start`. Use the second URL from the command output.

## Testing Elements

### web-component-tester

The tests are compatible with [web-component-tester](https://github.com/Polymer/web-component-tester). You can run them on multiple local browsers via:

```sh
npm install -g bower web-component-tester polymer-cli
npm install
bower install
npm test
```

## End to End testing

Sometimes a back end change is made that requires preview in the browser.
Notes on the process are in the [uqlibrary-pages readme](https://github.com/uqlibrary/uqlibrary-pages/blob/master/README.md#functionality-testing) in the functionality testing section

## Notes

* `/data/application.json` provides the navigation in [mylibrary](https://www.library.uq.edu.au/mylibrary/)
* Links can be sent via single signon by providing a `return` parameter, for example:

  `https://auth.library.uq.edu.au/login?return=aHR0cHM6Ly9zZWFyY2gubGlicmFyeS51cS5lZHUuYXUvcHJpbW8tZXhwbG9yZS9mYXZvcml0ZXM/dmlkPTYxVVEmbGFuZz1lbl9VUyZzZWN0aW9uPWl0ZW1z`

  Prompts for SSO, and if successful, lands at <https://search.library.uq.edu.au/primo-explore/favorites?vid=61UQ&lang=en_US&section=items>. Base64 encode the url before appending to the root path.
  * PHP function: `base64_encode(string);`
  * Javascript function: `btoa(string);`
