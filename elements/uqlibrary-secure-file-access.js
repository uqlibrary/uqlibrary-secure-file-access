(function () {
  Polymer({
    is: 'uqlibrary-secure-file-access',

    properties: {
      /*
       * show-hide the 4 panels on the page
       */
      isPanelInvalidRequest: {
        type: Boolean,
        value: false
      },

      // generally, something has gone wrong, api being unavailable is the most likely cause
      isPanelApiUnavailable: {
        type: Boolean,
        value: false
      },

      isPanelStatutoryCopyright: {
        type: Boolean,
        value: false
      },

      isPanelCommercialCopyright: {
        type: Boolean,
        value: false
      },

      isPanelRedirect: {
        type: Boolean,
        value: false
      },

      collectionType: {
        type: String,
        value: ''
      },

      pathnameLogin: {
        type: String,
        value: ''
      },

      pathnameDetail: {
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
      },

      urlRequested: {
        type: String,
        value: ''
      },

      emailAddress: {
        type: String,
        value: 'webmaster@library.uq.edu.au'
      },

      emailSubject: {
        type: String,
        value: ''
      },

      emailBody: {
        type: String,
        value: ''
      },

      // temporary variable to allow access to the new api
      apiVersion: {
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
      if (this.apiVersion === 'upgrade') {
        if (urlRequested === '') {
          return false;
        }
        this.setupPath(this.urlRequested, 'testcollection');

        this.requestCollectionFile('testcollection');

        this.loginAndGetApi();
      } else {
        if (this.pathname === '') {
          // called if it has not been initialised (in test)
          if (this.urlRequested !== '') {
            this.pathname = this.setupPath(this.urlRequested);
          } else {
            this.pathname = this.setupPath(window.location.pathname);
          }
        }

        var account = this.$.account;

        var self = this;
        account.addEventListener('uqlibrary-api-account-loaded', function (e) {
          if (e.detail.hasSession) {
            self.requestCollectionFile();
          } else {
            account.login(window.location.href);
          }
        });
// comment out for dev or it will loop infinitely
        account.get();
// comment out for prod - required in dev as login never happens
//     this.requestCollectionFile();
      }
    },

    /**
     * in test and prod, we will pass something like '/folder/something.pdf'
     * in dev, we will get '/collection.html'
     * @param pathName
     * @param typeRequest
     * @returns {*|string}
     */
    setupPath: function(pathName, typeRequest) {
      // we pass the window.location.pathname along directly to the api
      // if we get a paramter based url in dev, we must construct it first
      if (pathName === undefined || pathName === '') {
        // this should never happen
        console.log('ERROR: setupPath called without path in secure-file-access');
        return;
      }

      if (typeRequest === undefined || typeRequest === '' || typeof typeRequest === undefined) {
        // this should never happen
        typeRequest = 'testcollection';
      }
      console.log('this.apiVersion = '+this.apiVersion);
      var query, parts, pathname;
      if (this.apiVersion === 'upgrade') {
        console.log('calling upgrade api');
        if (pathName !== '/collection.html' && pathName !== '/collection2.html') {
          // we are in prod
          this.pathnameLogin = '/testlogin' + pathName;
          this.pathnameDetail = '/2' + pathName + '?acknowledged';
          console.log('4 this.pathnameDetail = '+this.pathnameDetail);
          console.log('4 this.pathnameLogin = '+this.pathnameLogin);
        } else {
          // we are in dev
          if (this.search !== '') {
            // has been set by call to this.setSearch
          } else if (window.location.search === undefined) {
            // this should never happen
          } else {
            this.setSearch(window.location.search);
          }

          // we are in dev and must join the params into a path
          console.log('this.search = '+this.search);
          // get rid of any erroneous trailing ?
          parts = this.search.split("?");
          parts.shift();
          if (parts.length > 1) {
            path = '?' + parts.shift();
          } else {
            path = this.search;
          }
          console.log('path = '+path);
          query = this.stripFirstChar(path);
          console.log('query = '+query);
          parts = query.split("&");

          pathname = '/';
          pathname += parts.map(function (kk, vv) {
            return kk.split('=').pop();
          }).join('/');
          console.log('typeRequest = '+typeRequest);
          console.log('1 pathname = '+pathname);
          this.pathnameLogin = '/testlogin' + pathname; // check if login is required
          this.pathnameDetail = '/2' + pathname + '?copyright'; // request the loggedin file
          console.log('2 this.pathnameDetail = '+this.pathnameDetail);
          console.log('2 this.pathnameLogin = '+this.pathnameLogin);
        }
      } else {
        console.log('calling old api');
        if (pathName !== '/collection.html' && pathName !== '/collection2.html') {
          // we are in prod
          this.pathname = pathName;
        } else {
          // we are in dev
          if (this.search !== '') {
            // has been set by call to this.setSearch
          } else if (window.location.search === undefined) {
            // this should never happen
          } else {
            this.setSearch(window.location.search);
          }

          // we are in dev and must join the params into a path
          query = this.stripFirstChar(this.search);
          parts = query.split("&");
          this.pathname = '/';
          this.pathname += parts.map(function (kk, vv) {
            return kk.split('=').pop();
          }).join('/');
          console.log('3 this.pathname = '+this.pathname);
        }
      }
      return this.pathname;
    },

    requestCollectionFile: function(typeRequest) {
      console.log('requestCollectionFile - ' + typeRequest);
      var apiUrl;
      if (this.apiVersion === 'upgrade') {
        if (typeRequest !== 'testcollection' && typeRequest !== 'collection') {
          return false;
        }

        apiUrl = '';
        if (typeRequest === 'testcollection') {
          console.log('requestCollectionFile: testcollection - this.pathnameLogin = ' + this.pathnameLogin);
          apiUrl = this.stripFirstChar(this.pathnameLogin); //strip opening slash
        } else {
          console.log('requestCollectionFile: collection - this.pathnameDetail = ' + this.pathnameDetail);
          apiUrl = this.stripFirstChar(this.pathnameDetail); //strip opening slash

        }
        if ('' !== apiUrl) {
          this.$.encodedUrlApi.get({plainUrl: apiUrl});
        }

        this.fileExtension =  this.getFileExtension();
      } else {
        // old code
        apiUrl = '';

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
          apiUrl = this.stripFirstChar(this.pathname) + '?copyright'; //strip opening slash
          // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
          //   set this.isValidRequest = false
          // }
          // vary deliver on method = get/serve


        }

        if ('' !== apiUrl) {
          this.$.encodedUrlApi.get({plainUrl: apiUrl});
        }
      }
    },

    stripFirstChar: function(input) {
      return input.substring(1);
    },

    setupEmail: function () {
      var emailSubject = 'Broken link to the Secure File Collection';
      // add the refer to the email they are prompted to send, where available
      if (document.referrer !== '') {
        emailSubject += ' from ' + document.referrer;
      }
      this.emailSubject = encodeURI(emailSubject);

      var emailBody = 'Hi there!' + "\n\n";
      emailBody += 'I\'d like to report a problem with the Secure File Collection.' + "\n";
      if (document.referrer !== '') {
        emailBody += 'I was visiting ' + document.referrer + ' and clicked a link.' + "\n";
      }
      emailBody += 'I landed on ' + window.location.href + ' but it said the link wasnt valid.' + "\n\n";
      emailBody += '(You can also include any other detail that will help us provide the file here, including where you were coming from)';
      this.emailBody = encodeURIComponent(emailBody);
    },

    loginAndGetApi: function () {
      var account = this.$.account;

      var self = this;
      account.addEventListener('uqlibrary-api-account-loaded', function (e) {
        if (e.detail.hasSession) {
          self.requestCollectionFile('collection');
        } else {
          account.login(window.location.href);
        }
        self.requestCollectionFile('collection');
      });
// comment out for dev or it will loop infinitely
       account.get();
// comment out for prod
//      this.requestCollectionFile('collection');
    }, /**
     * called when the api uqlibrary-api-collection-encoded-url returns
     * @param e
     */
    handleLoadedFile: function(e) {
      console.log('handleLoadedFile');
      // error: {response: true, responseText: "An unknown error occurred"}
      // no such folder: {response: "No such collection"}
      // ok: {url: "https://dddnk7oxlhhax.cloudfront.net/secure/exams/0001/3e201.pdf?...", displaypanel: 'redirect'}
      console.log(e.detail);
      if (e.detail.response === 'No such collection') {
        // the folder they requested is not known in the api
        // new folder? it should be added to the json in the api repo at package file config to enable it
        console.log('the folder is invalid or not yet available - '+e.detail.baseURI);
        this.setupEmail();
        this.showThisPanel('invalidRequest');
        return;

      } else if (e.detail.response === 'Login required') {
        this.loginAndGetApi();
        return;

      } else if (e.detail.url === undefined || e.detail.response === true) {
        // an error occurred - something unexpected went wrong, eg api is dead
        this.showThisPanel('filesUnavailable');
        return;
      }

      if (this.apiVersion === 'upgrade') {
        var panelName = '';
        if (!(e.detail.displaypanel === undefined)) {
          // it is? show the message and redirect
          panelName = this.getPanelName(e.detail.displaypanel);
          this.showThisPanel(panelName);
        }

        if (!(e.detail.url === undefined)) {
          this.deliveryFilename = e.detail.url;
          if ('redirect' === panelName) {
// commented out for dev
//        window.location.href = this.deliveryFilename;
          }
        }
      } else {
        console.log('here');
        if (e.detail.isOpenaccess) {
          // it is? show the message and redirect
          this.showThisPanel('redirect');

          this.deliveryFilename = e.detail.url;

// commented out for dev
//        window.location.href = finalHref;

        } else {
          this.showThisPanel('statutoryCopyright');

          this.deliveryFilename = e.detail.url;

        }
      }

    },

    // adding a new panel?
    // Add to getPanelName, showThisPanel & hideAllPanels
    getPanelName: function(panelname) {
      var validPanels = [
        'commercialCopyright',
        'statutoryCopyright',
        'redirect'
      ];
      if (validPanels.indexOf(panelname) === -1) {
        $result = 'invalidRequest';
      } else {
        $result = panelname;
      }
      console.log('getPanelName = '+$result);
      return $result;
    },

    // sadly we have to hardcode the panels
    showThisPanel: function(panelname) {
      console.log('showThisPanel '+panelname);
      if (panelname === 'filesUnavailable') {
        this.hideAllPanels();
        this.isPanelApiUnavailable = true;

      } else if (panelname === 'invalidRequest') {
        this.hideAllPanels();
        this.isPanelInvalidRequest = true;

      } else if (panelname === 'commercialCopyright') {
        this.hideAllPanels();
        this.isPanelCommercialCopyright = true;

      } else if (panelname === 'statutoryCopyright') {
        this.hideAllPanels();
        this.isPanelStatutoryCopyright = true;

      } else if (panelname === 'redirect') {
        this.hideAllPanels();
        this.isPanelRedirect = true;
      }
    },

    hideAllPanels: function() {
      this.isPanelApiUnavailable = false;
      this.isPanelInvalidRequest = false;
      this.isPanelCommercialCopyright = false;
      this.isPanelStatutoryCopyright = false;
      this.isPanelRedirect = false;
    },

    // getCollectionFolder: function(pathname) {
    //   if ('/' === pathname.substring(0, 1)) {
    //     parts = pathname.split('/');
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