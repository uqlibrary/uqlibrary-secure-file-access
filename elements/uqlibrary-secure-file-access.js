(function () {
  Polymer({
    is: 'uqlibrary-secure-file-access',

    properties: {
      /**
       * Application name for google analytics records.
       */
      gaAppName: {
        type: String,
        value: 'SecureFileAccess'
      },

      isValidRequest: {
        type: Boolean,
        value: true
      },

      isRedirect: {
        type: Boolean,
        value: false
      },

      pathProperties: {
        type: Array,
        value: [
          {
            name: 'coursebank', // pdf
            // dev notes - remove later
            oldPHP: '/coursebank/get.php',
            oldFileLocation: '/coursematerials/coursebank/', // unused? , included for transparency
            urlPath: '/collection/pdf/get/' // unused? , included for transparency
          },
          {
            name: 'exams',
            oldPHP: 'pdfserve.php',
            oldFileLocation: '/coursematerials/exams/',
            urlPath: '/collection/exams/get/'
          },
          // { // these folders havent been implemented yet
          //   name: 'coursematerials',
          //   oldPHP: 'eget.php', // ???
          //   oldFileLocation: '/coursematerials/',
          //   urlPath: '/collection/coursematerials/'
          // },
          // {
          //   name: 'cdbooks',
          //   oldPHP: 'acdb.php',
          //   oldFileLocation: '/cdbooks/',
          //   urlPath: '/collection/acdb/',
          //   fileId: 'rid'
          // },
          // {
          //   name: 'doc',
          //   oldPHP: 'pdfget.php',
          //   oldFileLocation: '/uqdocserv/',
          //   urlPath: '/collection/doc/',
          //   fileId: 'image'
          // },
          // {
          //   name: 'software',
          //   oldPHP: 'swget.php',
          //   oldFileLocation: '/uqsoftserv/',
          //   urlPath: '/collection/software/',
          // },
          // {
          //   name: 'bom',
          //   oldPHP: 'bom.php',
          //   oldFileLocation: '/bom/',
          //   urlPath: '/collection/bom/',
          //   pageHeader: 'Bureau of Meteorology - Climate Data',
          //   // pageSubheader: 'Bureau of Meteorology - Climate Data',
          //   content: 'Access to files in these datasets is restricted to UQ users.'
          //   hasList: true
          // },
          {
            name: 'thomson',
            oldPHP: 'thomson',
            oldFileLocation: '/thomson/',
            urlPath: '/collection/thomson/',
            pageHeader: 'Thomson Reuters Collections',
            hasList: true // this will be used in future to determine if list is a valid method to show a list of files page. it should default to false
          }
        ]
      },

      pageHeader: {
        type: String,
        value: 'UQ Library secure file collection'
      },

      filesAvailable: {
        type: Boolean,
        value: true
      },

      hideCopyrightMessage: {
        type: Boolean,
        value: true
      },

      collectionType : {
        type: String,
        value: ''
      },

      collectionTypeDefault : {
        type: String,
        value: ''
      },

      filePath : {
        type: String,
        value: ''
      },

      filePathDefault : {
        type: String,
        value: ''
      },

      pathname: {
        type: String,
        value: ''
      },

      search: {
        type: String,
        value: ''
      },

      subCollectionName: {
        type: String,
        value: ''
      },

      subCollectionNameDefault: {
        type: String,
        value: ''
      },

      methodType: {
        type: String,
        value: ''
      },

      methodTypeDefault: {
        type: String,
        value: ''
      }


    },

    // used for testing to simulate request variables
    setCollectionTypeDefault: function(value) {
      this.collectionTypeDefault = value;
    },
    setFilePathDefault: function(value) {
      this.filePathDefault = value;
    },
    setSubCollectionNameDefault: function(value) {
      this.subCollectionNameDefault = value;
    },
    setMethodTypeDefault: function(value) {
      this.methodTypeDefault = value;
    },
    setSearch: function(defaultValue) {
      if (this.search === '') {
        this.search = defaultValue;
      }
    },
    setPathname: function(defaultValue) {
      if (this.pathname === '') {
        this.pathname = defaultValue;
      }
    },

    ready: function() {
      // while we use an AWS Lambda to break the pretty url into html & parameters to be passed to call uqlibrary_pages
      // this doesnt actually make it to the browser
      // so once in javascript we have to manually break up the url to get the bits.
      // however, in dev we have to have the parametrs in the url. So, we have to do it both ways :(
      this.collectionType = this.getCollectionNameFromUrl(this.collectionTypeDefault);
      this.filePath = this.getFilePathFromUrl(this.filePathDefault);

      // this will be used once we are getting lists
      this.methodType = this.getVariableFromUrl('method', this.methodTypeDefault); // list for thomson or bom; missing otherwise - get or serve options handled by s3

      var self = this;
      window.addEventListener('WebComponentsReady', function() {

        var account = document.querySelector('uqlibrary-api-account');

        account.addEventListener('uqlibrary-api-account-loaded', function(e) {
          if (e.detail.hasSession) {
console.log('Logged in as ' + e.detail.id);
            self.requestCollectionFile();
          } else {
console.log('Not logged in');
            self.filesAvailable = false;
// comment out for dev | uncomment for prod (or loops endlessly)
            account.login(window.location.href);
          }
        });
        account.get();

      });
// uncomment for dev | comment out for prod
//      this.filesAvailable = true;
//      this.requestCollectionFile();
    },

    /**
     * eg window.location.pathname = "/thomson/classic_legal_texts/Baker_Introduction_to_Torts_2e.pdf" => thomson
     * @param defaultValue
     * @returns {*}
     */
    getCollectionNameFromUrl: function(defaultValue) {
      this.setSearch(window.location.search);
      this.setPathname(window.location.pathname);

      if (this.search !== '') {
        return this.getVariableFromUrl('collection', defaultValue);
      }

      if (this.pathname.startsWith('/')) {
        parts = this.pathname.split('/');
        if (parts.length >= 3) {
          parts.shift(); // discard the first bit = its from the initial slash
          return parts.shift();
        }
      }

      return this.useDefault(defaultValue);
    },

    /**
     *
     * eg window.location.pathname = "/thomson/classic_legal_texts/Baker_Introduction_to_Torts_2e.pdf" => classic_legal_texts/Baker_Introduction_to_Torts_2e.pdf
     * @param defaultValue
     * @returns string|boolean
     */
    getFilePathFromUrl: function(defaultValue) {
      this.setSearch(window.location.search);
      this.setPathname(window.location.pathname);

      if (this.search !== '') {
        return this.getVariableFromUrl('file', defaultValue);
      }

      if (this.pathname.startsWith('/')) {
        parts = this.pathname.split('/');
        if (parts.length >= 3) {
          parts.shift(); // discard the first bit = its from the initial slash
          parts.shift(); // discard the collection name
          return parts.join("/");
        }
      }

      return this.useDefault(defaultValue);
    },

    useDefault: function(defaultValue) {
      if (defaultValue === undefined || defaultValue === '') {
        return false;
      } else {
        return defaultValue;
      }
    },

    requestCollectionFile: function() {
      this.collection = this.loadCollectionDetail();
      if (false === this.collection) {
        this.isValidRequest = false;
      }

      this.checkValidRequest(); // needs to be set as it controls block display on page

      var linkToEncode = '';

      if (this.isValidRequest) {

        this.fileExtension =  this.getFileExtension();

//        var fileList = [];
        // thomson and bom supply a list page
        if (this.methodType === 'list') {
          // list: tbd
          // get an aws keyed url from api/files
          // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
          //   set this.isValidRequest = false
          // }
          // vary deliver on method = get/serve
//          fileList = 'something'; // replace with aws thingy
          // then display on page as list
        } else {
          linkToEncode = this.collectionType + "/" + this.filePath + '?copyright';

          // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
          //   set this.isValidRequest = false
          // }
          // vary deliver on method = get/serve


        }
      }

      if ('' !== linkToEncode) {
        this.$.encodedUrlApi.get({plainUrl: linkToEncode});
      }
    },

    /**
     * called when the api uqlibrary-api-collection-encoded-url returns
     * @param e
     */
    handleLoadedFile: function(e) {
      // error: {response: true, responseText: "An unknown error occurred"}
      // ok: {url: "https://files.library.uq.edu.au/secure/exams/0001/3e201.pdf"}
      if (e.detail.url === undefined || e.detail.response === true) {
        // an error occurred
        this.filesAvailable = false;
        return;
      }

      this.filesAvailable = true;

      this._setAccessCopyrightMessage(); // TODO: or do this with watcher?

      if (e.detail.isOpenaccess) {
        // it is? we shouldnt be here... show the other message and redirect

        this.isRedirect = true;
        this._setAccessCopyrightMessage(); // TODO: or do this with watcher?

        this.deliveryFilename = e.detail.url;
        console.log('handleLoadedFile: SHOULD REDIRECT TO ' + this.deliveryFilename);

// included for dev only
        this.isOpenaccess = true;

// commented out for dev
//        window.location.href = finalHref;

      } else {
        this.isOpenaccess = false; // this will need to be more complicated for bom & thomson lists

        this.deliveryFilename = e.detail.url;

      }
    },

    /**
     * determine whether we should show the 'this file is under copyright' message
     */
    _setAccessCopyrightMessage: function() {
      if (this.isOpenaccess) {
        this.hideCopyrightMessage = true; // not required - the file is openaccess
        return;
      }
      if (!this.isValidRequest) {
        this.hideCopyrightMessage = true; // we will show the 'invalid' panel
        return;
      }
      if (!this.filesAvailable) {
        this.hideCopyrightMessage = true; // we will show the 'offline/needs login' panel
        return;
      }
      if (this.isRedirect) {
        this.hideCopyrightMessage = true; // we will show the 'redirect to file' panel
        return;
      }

      this.hideCopyrightMessage = false; // show the 'copyright' panel
    },

    /**
     * determine if the url parameters ask for a valid file
     */
    checkValidRequest: function() {
      var requestedUrl = '';

      if (this.filePath === undefined || this.filePath === false) {
        this.isValidRequest = false;
        return;
      }

      var testCollection = this.pathProperties.filter(function (e) {
        return that.collectionType === e.name;
      });
      if (testCollection.length === 0) {
        this.isValidRequest = false;
      }


      // valid values for method can be 'get' or 'serve' for general collection types, or 'list' for thomson & bom
      // it is also overloaded as {collection name} for thomson
// I dont think we need this - S3 is looking after get/serve. or is just going to be list?
//       if (this.methodType === false) {
//         this.methodType = 'serve';
//       }
    },

    /*
    _showList: function () {
      this._switchToPage(0);
      this.fire('show-list');
    },
    */

    /**
     * extract the values out of the data passed in the url
     * @param variable
     * @param defaultValue
     * @returns string|boolean
     */
    getVariableFromUrl: function(variable, defaultValue) {
      var startChar = '?'.length;
      var query = window.location.search.substring(startChar);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] === variable) {
          return pair[1];
        }
      }
      if (defaultValue === undefined || defaultValue === '') {
        return false;
      } else {
        return defaultValue;
      }
    },

    /**
     * get the details for the specific folder out of the array
     * @returns array|boolean
     */
    loadCollectionDetail: function() {
      var collection = false;

      that = this;
      collection = this.pathProperties.filter(function (e) {
        return that.collectionType === e.name;
      });

      if (collection) {
        return collection[0];
      } else {
        return false;
      }
    },

    /**
     * if the filename has a '.' in it then we return the file extension to tell the user to make sure the file extension is set
     * @returns int|boolean
     */
    getFileExtension: function() {
      if (this.filePath === undefined) {
        return false;
      }

      var dotPosition = this.filePath.lastIndexOf('.');
      if (dotPosition !== undefined && dotPosition >= 0) {
        return this.filePath.substr(dotPosition + 1);
      } else {
        return false;
      }
    }

    /**
     * Callback for loaded account - they must be logged in
     * @param e
     */
//     accountLoaded: function (e) {
//       if (e.detail.hasSession) {
//         //     if (document.getElementById('preloader'))
// console.log('accountLoaded - has session');
//       }
//       else {
// console.log('accountLoaded - not logged in');
//         // Not logged in
//         this.$.account.login(window.location.href);
//       }
//     }
  });
})();