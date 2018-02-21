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

      // showPanel: {
      //   type: String,
      //   value: 'unknown',
      //   observer: 'isPanel'
      // },

      isPanelFilesUnavailable: {
        type: Boolean,
        value: false
      },

      isPanelInvalidRequest: {
        type: Boolean,
        value: false
      },

      isPanelCopyright: {
        type: Boolean,
        value: false
      },

      isPanelRedirect: {
        type: Boolean,
        value: false
      },

      pageHeader: {
        type: String,
        value: 'UQ Library secure file collection'
      },

      collectionType: {
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
console.log('start of ready');
      if (this.pathname === '') {
        // called if it has not been initialised (in test)
        this.pathname = this.setupPath(window.location.pathname);
      }

      var account = this.$.account;

      var self = this;
      account.addEventListener('uqlibrary-api-account-loaded', function (e) {
console.log('in addEventListener');
        if (e.detail.hasSession) {
console.log('Logged in as ' + e.detail.id);
          self.requestCollectionFile();
        } else {
console.log('Not logged in');
          self.selectPanel("invalidRequest");

          account.login(window.location.href);
        }
        account.get();

      });
// comment out for prod - required in dev as login never happens
//      this.requestCollectionFile();
    },

    /**
     * in test and prod, we will pass something like '/folder/something.pdf'
     * in dev, we will get '/collection.html'
     * @param newPathname
     */
    setupPath: function(newPathname) {
console.log('start of setupPath: newPathname = '+newPathname);
      // we pass the window.location.pathname along directly to the api
      // if we get a paramter based url in dev, we must construct it first
      if (newPathname === undefined || newPathname === '') {
        // this should never happen
        console.log('ERROR: setupPath called without path in uqlibrary-secure-file-access');
      } else if (newPathname === '/collection.html') {
        // we are in dev
        if (this.search !== '') {
          // has been set by call to this.setSearch
        } else if (window.location.search === undefined) {
          // this should never happen
        } else {
          this.search = window.location.search;
        }
console.log('this.search = '+this.search);
        // we are in dev and must join the params into a path
        var query = this.stripFirstChar(this.search);
console.log('query = '+query);
        var parts = query.split("&");
console.log('parts = ');
console.log(parts);
        this.pathname = '/' + parts.map(function(kk,vv) {
          return kk.split('=').pop();
        }).join('/');
      } else {
        // we are in prod
        this.pathname = newPathname
      }
console.log('this.pathname = '+this.pathname);
      return this.pathname;
    },



    requestCollectionFile: function() {
console.log('start of requestCollectionFile');
      var linkToEncode = '';

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
        linkToEncode = this.stripFirstChar(this.pathname) + '?copyright'; //strip opening slash
console.log('linkToEncode = '+linkToEncode);
        // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
        //   set this.isValidRequest = false
        // }
        // vary deliver on method = get/serve


      }
      // }

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
console.log('start of handleLoadedFile');
      // error: {response: true, responseText: "An unknown error occurred"}
      // ok: {url: "https://dddnk7oxlhhax.cloudfront.net/secure/exams/0001/3e201.pdf?...", isOpenaccess: false}
      if (e.detail.url === undefined || e.detail.response === true) {
        // an error occurred
        this.selectPanel('invalidRequest');
        return;
      }

      if (e.detail.isOpenaccess) {
        // it is? show the message and redirect
        this.selectPanel('redirect');

        this.deliveryFilename = e.detail.url;
console.log('handleLoadedFile: SHOULD REDIRECT TO ' + this.deliveryFilename);

// commented out for dev
//        window.location.href = finalHref;

      } else {
        this.selectPanel('copyright');

        this.deliveryFilename = e.detail.url;

      }
    },

    selectPanel: function (panelname) {
console.log('start of selectPanel: panelname = ' + panelname);
      if (panelname === 'filesUnavailable') {
        this.isPanelFilesUnavailable = false;
        this.isPanelInvalidRequest = false;
        this.isPanelCopyright = false;
        this.isPanelRedirect = false;

      } else if (panelname === 'invalidRequest') {
        this.isPanelFilesUnavailable = false;
        this.isPanelInvalidRequest = true;
        this.isPanelCopyright = false;
        this.isPanelRedirect = false;

      } else if (panelname === 'copyright') {
        this.isPanelFilesUnavailable = false;
        this.isPanelInvalidRequest = false;
        this.isPanelCopyright = true;
        this.isPanelRedirect = false;

      } else if (panelname === 'redirect') {
        this.isPanelFilesUnavailable = false;
        this.isPanelInvalidRequest = false;
        this.isPanelCopyright = false;
        this.isPanelRedirect = true;
      }
    },

    // getCollectionFolder: function() {
    //   if (this.pathname.startsWith('/')) {
    //     parts = this.pathname.split('/');
    //     if (parts.length >= 3) {
    //       parts.shift(); // discard the first bit = its from the initial slash
    //       return parts.shift(); // the next bit is the collection name
    //     }
    //   }
    //   return false;
    // },

    /*
    _showList: function () {
      this._switchToPage(0);
      this.fire('show-list');
    },
    */


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