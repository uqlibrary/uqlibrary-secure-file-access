# uqlibrary-secure-file-access

[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access.svg)](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-secure-file-access?type=dev)

uqlibrary-secure-file-access provides logged in access to files stored on AWS

There is currently no documentation at [GitHub Pages](http://uqlibrary.github.io/uqlibrary-secure-file-access).

This component is called from collection.html in uqlibrary-pages to show a copyright acknowledgement page before viewing eg a pdf file stored in s3 at uql_secure_files on AWS

### Getting Started
Install Node.JS and run the following oneliner in the project directory:
```sh
npm install -g bower && bower install
```

### Developing
- Please adhere to the Polymer code style guide provided at [Style Guide](http://polymerelements.github.io/style-guide/). 
- Colors and common styles are imported (bower install) from [uqlibrary-styles](http://github.com/uqlibrary/uqlibrary-styles).
- GitHub pages should be updated after every commit to Master by running the "generate-gh-pages.sh" in the /bin/ directory

### Testing
Tests are run using the Web Component Tester. Either navigate to /tests/index.html in a browser or using the command line:
```sh
wct --local all
```
