(function () {
  Polymer({
    is: 'uqlibrary-secure-file-access',

    properties: {
      /**
       * Application name for google analytics records.
       */
      // gaAppName: {
      //   type: String,
      //   value: 'SecureFileAccess'
      // },

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

      collectionType: {
        type: String,
        value: ''
      },

      // collectionTypeDefault: {
      //   type: String,
      //   value: ''
      // },

      // filePath: {
      //   type: String,
      //   value: ''
      // },
      //
      // filePathDefault: {
      //   type: String,
      //   value: ''
      // },

      pathname: {
        type: String,
        value: ''
      },

      search: {
        type: String,
        value: ''
      },

      methodType: {
        type: String,
        value: ''
      }
    },

    setSearch: function (value) {
      if (this.search === '') {
        this.search = value;
      }
    },

    ready: function () {
      if (this.pathname === '') {
        // called if it has not been initialised (in test)
        this.pathname = this.setupPath(window.location.pathname);
      }

      if (!this.checkValidRequest()) {
        this.filesAvailable = false;
        return;
      }

      // this will be used once we are getting lists
//      this.methodType = this.getVariableFromUrl('method', this.methodTypeDefault); // list for thomson or bom; missing otherwise - get or serve options handled by s3

      var self = this;
      window.addEventListener('WebComponentsReady', function () {

        var account = document.querySelector('uqlibrary-api-account');

        account.addEventListener('uqlibrary-api-account-loaded', function (e) {
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
     * in test and prod, we will pass something like '/folder/somwething.pdf'
     * in dev, we will get 'collection.html?
     * @param newPathname
     */
    setupPath: function(newPathname) {
      // we pass the window.location.pathname along directly to the api
      // if we get a paramter based url in dev, we must construct it first
      if (newPathname === undefined || newPathname === '') {
        // this should never happen
        console.log('ERROR: setupPath called without path');
      } else if (newPathname === '/collection.html') {
        // we are in dev
        if (this.search !== '') {
          // has been set by call to this.setSearch
        } else if (window.location.search === undefined) {
          // this should never happen
        } else {
          this.search = window.location.search;
        }
        // we are in dev and must join the params into a path
        var startChar = '?'.length;
        var query = this.search.substring(startChar);
        var parts = query.split("&");
        this.pathname = '/' + parts.map(function(kk,vv) {
          return kk.split('=').pop();
        }).join('/');
        // this.pathname = '/' + parts. replace(',', '/');
      } else {
        // we are in prod
        this.pathname = newPathname
      }
      return this.pathname;
    },



    requestCollectionFile: function() {
      this.collection = this.loadCollectionDetail();
      if (false === this.collection) {
        this.isValidRequest = false;
      }

      // this.checkValidRequest(); // needs to be set as it controls block display on page

      var linkToEncode = '';

      if (this.checkValidRequest()) {

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
          //strip opening slash
          linkToEncode = this.stripFirstChar(this.pathname) + '?copyright';

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

    stripFirstChar: function(input) {
      return input.substring(1);
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
     * @param collectionName - supplied for unit test
     * @returns boolean
     */
    checkValidRequest: function(collectionName) {
      if (collectionName === undefined || collectionName === '') {
        collectionName = this.getCollectionFolder();
      }
      var requestedUrl = '';
      this.isValidRequest = false;
      if (this.pathname === undefined || this.pathname === false) {
        return this.isValidRequest;
      }

      var that = this;
      var testCollection = this.pathProperties.filter(function (e) {
        return collectionName === e.name;
      });
      this.isValidRequest =  (testCollection.length !== 0);

      return this.isValidRequest;
    },

    getCollectionFolder: function() {
      if (this.pathname.startsWith('/')) {
        parts = this.pathname.split('/');
        if (parts.length >= 3) {
          parts.shift(); // discard the first bit = its from the initial slash
          return parts.shift();
        }
      }
      return false;
    },

    /*
    _showList: function () {
      this._switchToPage(0);
      this.fire('show-list');
    },
    */


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
      if (this.pathname === undefined) {
        return false;
      }

      var dotPosition = this.pathname.lastIndexOf('.');
      if (dotPosition !== undefined && dotPosition >= 0) {
        return this.pathname.substr(dotPosition + 1);
      } else {
        return false;
      }
    }
  });
})();