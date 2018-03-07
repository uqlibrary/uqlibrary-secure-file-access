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

      // generally, something has gone wrong, but api being unavailable is the most likely cause
      isPanelApiUnavailable: {
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
//      this.requestCollectionFile();
    },

    /**
     * in test and prod, we will pass something like '/folder/something.pdf'
     * in dev, we will get '/collection.html'
     * @param newPathname
     */
    setupPath: function(newPathname) {
      // we pass the window.location.pathname along directly to the api
      // if we get a paramter based url in dev, we must construct it first
      if (newPathname === undefined || newPathname === '') {
        // this should never happen
        console.log('ERROR: setupPath called without path in uqlibrary-secure-file-access');
        return;
      }

      if (newPathname.endsWith('x')) {

      }
      if (!this._endsWith(newPathname, '/collection.html')) {
        // we are in prod
        this.pathname = newPathname;
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
        var query = this.stripFirstChar(this.search);
        var parts = query.split("&");
        this.pathname = '/';
        this.pathname += parts.map(function(kk,vv) {
          return kk.split('=').pop();
        }).join('/');
      }
      return this.pathname;
    },

    _endsWith: function(haystack, needle) {
      const pattern = '(.*)' + needle;
      var regExp = new RegExp(pattern, "g");
      return regExp.test(haystack);
    },

    requestCollectionFile: function() {
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
        // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
        //   set this.isValidRequest = false
        // }
        // vary deliver on method = get/serve


      }

      if ('' !== linkToEncode) {
        this.$.encodedUrlApi.get({plainUrl: linkToEncode});
      }
    },

    stripFirstChar: function(input) {
      return input.substring(1);
    },

    /**
     * the folder they requested is not known in the api
     * new folder? it should be added to the json in the api repo at package file config to enable it
     */
    setInvalid: function () {
      console.log('the folder ' + this.getCollectionFolder() + ' is invalid or not yet available');

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
      emailBody += '(include any other detail that will help us provide the file here, including where you were coming from)';
      this.emailBody = encodeURIComponent(emailBody);

      this.selectPanel('invalidRequest');
    },

    /**
     * called when the api uqlibrary-api-collection-encoded-url returns
     * @param e
     */
    handleLoadedFile: function(e) {
      // error: {response: true, responseText: "An unknown error occurred"}
      // no such folder: {response: "No such collection"}
      // ok: {url: "https://dddnk7oxlhhax.cloudfront.net/secure/exams/0001/3e201.pdf?...", isOpenaccess: false}
      if (e.detail.response === 'No such collection') {
        this.setInvalid();
        return;
      } else if (e.detail.url === undefined || e.detail.response === true) {
        // an error occurred - something unexpected went wrong, eg api is dead
        this.selectPanel('filesUnavailable');
        return;
      }

      if (e.detail.isOpenaccess) {
        // it is? show the message and redirect
        this.selectPanel('redirect');

        this.deliveryFilename = e.detail.url;

// commented out for dev
//        window.location.href = finalHref;

      } else {
        this.selectPanel('copyright');

        this.deliveryFilename = e.detail.url;

      }
    },

    selectPanel: function (panelname) {
      if (panelname === 'filesUnavailable') {
        this.isPanelApiUnavailable = true;
        this.isPanelInvalidRequest = false;
        this.isPanelCopyright = false;
        this.isPanelRedirect = false;

      } else if (panelname === 'invalidRequest') {
        this.isPanelApiUnavailable = false;
        this.isPanelInvalidRequest = true;
        this.isPanelCopyright = false;
        this.isPanelRedirect = false;

      } else if (panelname === 'copyright') {
        this.isPanelApiUnavailable = false;
        this.isPanelInvalidRequest = false;
        this.isPanelCopyright = true;
        this.isPanelRedirect = false;

      } else if (panelname === 'redirect') {
        this.isPanelApiUnavailable = false;
        this.isPanelInvalidRequest = false;
        this.isPanelCopyright = false;
        this.isPanelRedirect = true;
      }
    },

    getCollectionFolder: function() {
      if (this.pathname.startsWith('/')) {
        parts = this.pathname.split('/');
        if (parts.length >= 3) {
          parts.shift(); // discard the first bit = its from the initial slash
          return parts.shift(); // the next bit is the collection name
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