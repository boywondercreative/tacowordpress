var TacoWordPress = TacoWordPress || {};

TacoWordPress.FieldLinks = {
  instances: [],
  $last_textfield: null,
  prev_title_text: null,
  wpActiveEditor: null,
  wpLink: null
};

TacoWordPress.FieldLinks.FieldLink = function($object) {
  this.init($object);
  TacoWordPress.FieldLinks.instances.push(this);
  this.instance_id = new Date().getTime(); // for debugging
};

TacoWordPress.FieldLinks.FieldLink.prototype = {
  static_self: TacoWordPress.FieldLinks,
  instance_id: null,
  href: null,
  title: null,
  $object: null,

  init: function($object) {
    this.$object = $object;
    this.static_self.wpActiveEditor = window.wpActiveEditor || null;
    this.static_self.wpLink = window.wpLink;
    var $ = window.jQuery || window.$;

    if($object.val().search(/\{/) > -1) {
      var link_object = JSON.parse($object.val());
      this.href = link_object.href;
      this.title = link_object.title;
    }

    $object.css('width', '60%');
    $object.prop('readonly', true);

    $object.parent().append([
      this.getAddButtonTemplate(),
      this.getRemoveButtonTemplate() + ' ',
      this.getEditButtonTemplate() + ' ',
      this.getActualValueInputTemplate(
        this.href, $object.val(), $object.attr('name')
      ),
      this.getDescriptionTemplate()
    ].join(''));
    
    $object.attr('name', $object.attr('name') + '_old');

    $object.val((this.href) ? this.href : '');
    
    if(this.title) {
      $object.parent().find('.description')
        .html([
          '<b>link text:</b> <span class="link-text">"',
          this.title, '"</span>'
        ].join(''));

      $object.parent().find('.btn-remove').show();
      $object.parent().find('.btn-add').hide();
    } else {
      $object.parent().find('.btn-remove').hide();
      $object.parent().find('.btn-edit').hide();
    }
    this.static_self.prev_title_text = $('#link-title-field')
      .prev('span').text();

    this.initEvents();
  },

  getAddButtonTemplate: function() {
    return [
      '<button class="btn-add button button-secondary">',
      'Add Link</button>'
    ].join('');
  },

  getRemoveButtonTemplate: function() {
    return [
      '<button class="btn-remove button button-secondary">',
      'Remove Link</button>'
    ].join('');
  },

  getEditButtonTemplate: function() {
    return [
      '<button class="btn-edit button button-secondary">',
      'Edit Link</button>'
    ].join('');
  },

  getActualValueInputTemplate: function(href, val, name) {
    return [
      '<input value="', ((href) ? encodeURIComponent(val) : ''),
      '" type="hidden" class="actual-value" name="', name, '">'
    ].join('');

  },

  getDescriptionTemplate: function() {
    return '<p class="description"></p>';
  },

  initEvents: function() {
    var self = this;
    var $object = this.$object;
    var static_self = this.static_self;
    var $ = window.jQuery || window.$;

    this.$object.parent().find('.btn-add').on('click', function(e) {
      e.preventDefault();
      static_self.wpActiveEditor = true;
      static_self.wpLink.open();
      $('#link-title-field').prev('span').text('Body');
      self.static_self.$last_textfield = $object;
      return false;
    });

    this.$object.parent().find('.btn-edit').on('click', function(e) {
      e.preventDefault();
      static_self.wpActiveEditor = true;
      static_self.wpLink.open();
      $('#url-field').val($object.val());
      $('#wp-link-submit').val('Update');
      self.static_self.$last_textfield = $object;
      
      var link_text = $object.siblings('.description')
      .find('.link-text').text()
      .replace(/^\"|\"$/g, '');

      $('#link-title-field').val((link_text));
    });

    this.$object.parent().find('.btn-remove').on('click', function(e) {
      $object.parent().find('.btn-add').show();
      e.preventDefault();
      $object.val('');
      $(this).hide();
      $object.parent().find('.btn-edit').hide();
      $object.parent().find('.actual-value').val('');
      $object.parent().find('.description').text('');
    });
    
    $('body').on('click', '#wp-link-submit', function(event) {
      var linkAtts = self.static_self.wpLink.getAttrs();
      self.static_self.$last_textfield.parent().find('.actual-value')
        .val(encodeURIComponent(JSON.stringify(linkAtts)));
      
      self.static_self.$last_textfield.val(linkAtts.href);
      
      static_self.wpLink.textarea = $('body');
      static_self.wpLink.close();

      self.static_self.$last_textfield.parent()
        .find('.btn-remove').show();
      
      self.static_self.$last_textfield.parent()
        .find('.btn-add').hide();
      
      self.static_self.$last_textfield.parent()
        .find('.btn-edit').show();

      self.static_self.$last_textfield.parent()
        .find('.description')
        .html([
          '<b>link text:</b> <span class="link-text">"',
          linkAtts.title,
          '"</span>'
          ].join(''));

      if(event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      event.stopPropagation();
    });

    $('body').on('click', '#wp-link-cancel, #wp-link-close', function(event) {
      $('#link-title-field').prev('span')
        .text(static_self.prev_title_text);

      static_self.wpLink.textarea = $('body');
      static_self.wpLink.close();

      if(event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      event.stopPropagation();
      return false;
    });

  }
};

(function($) {
  $('input[type="link"]').each(function() {
    new TacoWordPress.FieldLinks.FieldLink($(this));
  });
})(jQuery);