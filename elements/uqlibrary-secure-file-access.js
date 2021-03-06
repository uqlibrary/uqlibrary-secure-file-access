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

      isPanelNoAccess: {
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
      }
    },

    setSearch: function (value) {
      if (this.search === '') {
        this.search = value;
      }
    },

    ready: function () {
      if (this.urlRequested === undefined || this.urlRequested === '') {
        return false;
      }
      this.setupPath(this.urlRequested); //, 'testlogin');

      this.requestCollectionFile('testlogin');

      this.fileExtension =  this.getFileExtension(this.urlRequested);
    },

    /**
     * in test and prod, we will pass something like '/folder/something.pdf'
     * in dev, we will get '/collection.html'
     * @param pathName
     * @returns {*|string}
     */
    setupPath: function (pathName) {
      // we pass the window.location.pathname along directly to the api
      // if we get a paramter based url in dev, we must construct it first
      if (pathName === undefined || pathName === '') {
        // this should never happen
        console.log('ERROR: setupPath called without path in secure-file-access');
        return;
      }

      var query, parts;
      if (!(this._endsWith(pathName, '/collection.html'))) {
        // we are in prod
      } else {
        // we are in dev
        if (this.search !== '') {
          // has been set by call to this.setSearch
        } else if (window.location.search === undefined) {
          // this should never happen
          return;
        } else {
          this.setSearch(window.location.search);
        }

        pathName = this.buildPathnameFromSearchParams();
      }

      this.pathnameLogin = '/testlogin' + pathName + '?acknowledged'; // check if login is required
      this.pathnameDetail = pathName + '?acknowledged'; // request the loggedin file

      return this.pathname;
    },

    _endsWith: function(haystack, needle) {
      const pattern = '(.*)' + needle;
      var regExp = new RegExp(pattern, "g");
      return regExp.test(haystack);
    },

    buildPathnameFromSearchParams: function() {
      // we are in dev and must join the params into a path
      var parts = this.search.split("?"); // get rid of any erroneous trailing ?
      parts.shift();
      var path;
      if (parts.length > 1) {
        path = '?' + parts.shift();
      } else {
        path = this.search;
      }
      var query = this.stripFirstChar(path);
      parts = query.split("&");

      var pathname = '/';
      pathname += parts.map(function (kk, vv) {
        return kk.split('=').pop();
      }).join('/');
      return pathname;
    },

    requestCollectionFile: function(typeRequest) {
      var apiUrl = '';
      if (typeRequest === 'testlogin') {
        apiUrl = this.stripFirstChar(this.pathnameLogin); //strip opening slash

      } else if (typeRequest === 'collection') {
        apiUrl = this.stripFirstChar(this.pathnameDetail); //strip opening slash

      } else {
        // should never happen
        console.log('ERROR: collection request type not specified');
        return false;
      }

      if ('' !== apiUrl) {
        this.$.encodedUrlApi.get({plainUrl: apiUrl});
      }
    },

    stripFirstChar: function(input) {
      if (input === undefined || 0 >= input.length) {
        return input;
      }
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
        // self.requestCollectionFile('collection');
      });

      // comment out for dev or it will loop infinitely
      account.get();

      // comment out for prod
      // this.requestCollectionFile('collection');
    }, /**
     * called when the api uqlibrary-api-collection-encoded-url returns
     * @param e
     */
    handleLoadedFile: function(e) {
      // error: {response: true, responseText: "An unknown error occurred"}
      // no such folder: {response: "No such collection"}
      // unauthorised user: {response: "Invalid User"}
      // ok: {url: "https://dddnk7oxlhhax.cloudfront.net/secure/exams/0001/3e201.pdf?...", displaypanel: 'redirect'}
      if (e.detail.response === 'No such collection') {
        // the folder they requested is not known in the api
        // new folder? it should be added to the json in the api repo at package file config to enable it
        console.log('the folder is invalid or not yet available');
        this.setupEmail();
        this.showThisPanel('invalidRequest');
        return;

      } else if (e.detail.response === 'Invalid User') {
        // only staff and students have access - others, eg em users, dont
        this.showThisPanel('noAccess');
        return;

      } else if (e.detail.response === 'Login required') {
        this.loginAndGetApi();
        return;

      } else if (e.detail.url === undefined || e.detail.response === true) {
        // an error occurred - something unexpected went wrong, eg api is dead
        this.showThisPanel('filesUnavailable');
        return;
      }

      var panelName = '';
      if (!(e.detail.displaypanel === undefined)) {
        panelName = this.getPanelName(e.detail.displaypanel);
        this.showThisPanel(panelName);
      }

      if (!(e.detail.url === undefined)) {
        this.deliveryFilename = e.detail.url;
        if ('redirect' === panelName) {
          window.location.href = this.deliveryFilename;
        }
      }

    },

    // adding a new panel?
    // Add to getPanelName, showThisPanel & hideAllPanels
    getPanelName: function(panelname) {
      const validPanels = [
        'commercialCopyright',
        'statutoryCopyright',
        'redirect',
        'isPanelNoAccess'
      ];
      const $result = (validPanels.indexOf(panelname) === -1) ? 'invalidRequest': panelname;
      return $result;
    },

    // sadly we have to hardcode the panels
    showThisPanel: function(panelname) {
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

      } else if (panelname === 'noAccess') {
        this.hideAllPanels();
        this.isPanelNoAccess = true;

      }
    },

    hideAllPanels: function() {
      this.isPanelApiUnavailable = false;
      this.isPanelInvalidRequest = false;
      this.isPanelCommercialCopyright = false;
      this.isPanelStatutoryCopyright = false;
      this.isPanelRedirect = false;
      this.isPanelNoAccess = false;
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
    getFileExtension: function(url) {
      if (url === undefined) {
        return false;
      }

      var dotPosition = url.lastIndexOf('.');
      if (dotPosition !== undefined && dotPosition >= 0) {
        return url.substr(dotPosition + 1);
      } else {
        return false;
      }
    }
  });
})();
