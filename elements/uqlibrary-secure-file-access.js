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
        value: 'UQ Library pdf collection'
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

    /*
     * Builds the url and opens it.
     */
    // _searchActivated: function(e) {
    //
    //   var searchText = this.$.searchKeywordInput.value;
    //
    //   var searchUrl = this._selectedSource.urlRoot + searchText;
    //   if (this._selectedSource.urlAppend) {
    //     searchUrl += this._selectedSource.urlAppend;
    //   }
    //   searchUrl = encodeURI(searchUrl);
    //
    //   this.async(function () {
    //     window.open(searchUrl, '_blank');
    //   }, 100);
    //
    //   this.$.ga.addEvent(this.searchType, searchText);
    // },

    ready: function() {
      //this.$.account.get(); // they must be logged in, so auto load

      window.addEventListener('WebComponentsReady', function() {

        var account = document.querySelector('uqlibrary-api-account');

        var self = this;
        account.addEventListener('uqlibrary-api-account-loaded', function(e) {
          if (e.detail.hasSession) {
            console.log('Logged in as ' + e.detail.id);
          } else {
            console.log('Not logged in');
            self.$.account.login(window.location.href);
          }
        });

        account.get();

      });

      this.collectionType = this.getVariableFromUrlParameter('collection', this.collectionTypeDefault);
      this.subCollectionName = this.getVariableFromUrlParameter('subCollection', this.subCollectionNameDefault);
      this.filePath = this.getVariableFromUrlParameter('file', this.filePathDefault);
      this.methodType = this.getVariableFromUrlParameter('method', this.methodTypeDefault); // list for thomson or bom; missing otherwise - get or serve options handled by s3

      // var acceptCopyrightButton = document.querySelector('#acceptCopyrightButton');
      // if (typeof(acceptCopyrightButton) !== 'undefined' && acceptCopyrightButton) {
      //   //// Listen for template bound event to know when bindings
      //   //// have resolved and content has been stamped to the page
      //   acceptCopyrightButton.addEventListener('dom-change', function () {
      //       redirect to cloudfront url
      //   });
      // }

//       var self = this;
//       this.$.account.addEventListener('uqlibrary-api-account-loaded', function (e) {
//         if (e.detail.hasSession) {
// console.log('logged in');
//         } else {
// console.log('not logged in');
//           // Not logged in
//             self.$.account.login(window.location.href);
//         }
//       });

      var displayContent = document.querySelector('#layout');

      this.collection = this.loadCollectionDetail();
      if (false === this.collection) {
        this.pageHeader = 'Invalid file location';
        return;
      }

      this.checkValidRequest(); // needs to be set as it controls block display on page

      if (this.isValidRequest) {

        var linkToEncode = this.collectionType + "/" + this.filePath + '?copyright';

        this.fileExtension =  this.getFileExtension();


        // var self = this;
//     this.$.encodedUrlApi.addEventListener('uqlibrary-api-collection-encoded-url', function (e) {
//       console.log(e);
//       if (e.detail.url) {
//         self.clickableLink = e.detail.url;
// console.log('self.clickableLink: ' + self.clickableLink);
//       }
//     });
//         this.$.list.addEventListener('uqlibrary-api', function (e) {
//           self.list = e.detail;
//           self.fire('uqlibrary-api-collection-encoded-url', self.list);
//         });


        var fileList = [];
        // thomson and bom supply a list page
        if (this.methodType === 'list') {
          // list: tbd
          // get an aws keyed url from api/files
          // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
          //   set this.isValidRequest = false
          // }
          // vary deliver on method = get/serve
          fileList = 'something'; // replace with aws thingy
          // then display on page as list
        } else {
          this.$.encodedUrlApi.get({plainUrl: linkToEncode});


          // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
          //   set this.isValidRequest = false
          // }
          // vary deliver on method = get/serve
        }
      } else {
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
      }
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
        this.hideCopyrightMessage = true; // we will show the 'offline' panel
        return;
      }
      if (this.isRedirect) {
        this.hideCopyrightMessage = true; // we will show the 'redirect' panel
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

    /**
     * get the name of the subcollection for those colections which allow one
     * @private
     */
    _getSubcollection: function() {
      var subcollectionName = '';
      var hasSubcollection = false;
      if (this.collectionType === 'thomson') { // also bom?
        hasSubcollection = true;
      }

      if (hasSubcollection) {
        this.subCollectionName = this.methodType;
        // this.methodType = 'serve';
        // } else {
        //   if (collection.validMethods.indexOf(method) === -1) {
        //     // invalid method found
        //     isValidRequest = false
        //   }
      }
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
    getVariableFromUrlParameter: function(variable, defaultValue) {
      var query = window.location.search.substring(1);
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
    },

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