(function () {
  Polymer({
    is: 'style-guide',
    properties: {
      selected: {
        type: Number,
        value: 0
      }
    },

    ready: function() {
      console.log(this.selected);
    }
  });
})();

