var contactForm = {
  addContact: function() {
    event.preventDefault();

    var data = {
      "full_name": $("#fullName").val(),
      "email": $("#email").val(),
      "phone_number": $("#phone").val(),
      "tags": $("#tag").val(),
    };

    var self = this;
    var json = JSON.stringify(data);
    var req = new XMLHttpRequest();
    req.open('POST', 'http://localhost:4567/api/contacts');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(json);

    req.addEventListener('load', function() {
      if (req.status === 201){
        $('#createContact').hide({
          complete: function() {
            self.updateContactList();
          },
        });
      }
    });
  },
  updateContact: function() {
    event.preventDefault();
    var self = this;
    var data = {
      "full_name": $("#editContact #fullName").val(),
      "email": $("#editContact #email").val(),
      "phone_number": $("#editContact #phone").val(),
      "tags": $("#editContact #tag").val(),
    };

    var id = $("#editContact #id").val();

    var json = JSON.stringify(data);
    var req = new XMLHttpRequest();

    req.open('PUT', 'http://localhost:4567/api/contacts/' + id);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(json);
    req.addEventListener('load', function() {
      if (req.status === 201) {
        $('#editContact').hide({
          complete: function() {
            self.updateContactList();
          }
        });
      }
    });
  },
  updateContactList: function() {
    var self = this;
    var req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:4567/api/contacts');
    req.responseType = 'json';
    req.send();
    req.addEventListener('load', function() {
      self.contacts = req.response;
      $('.cardgroup').children().remove();
      var contactTagArray = self.generateContactTagArray();
      $('.cardgroup').append(self.ccTemplate({ contacts: contactTagArray }));
      $('#messageBox').children().remove();
      $('#frontPage').show('slow');
    });
  },
  createContact: function() {
    event.preventDefault();
    var self = this;
    $('#frontPage').hide({
      complete: function() {
        $('#createContact').show('slow');
      }
    });
  },
  editContact: function() {
    event.preventDefault();
    var self = this;
    var id = $(event.target).parents('.oneCard').attr('data-id');
    $('#frontPage').hide({
      complete: function() {
        var contact = self.contacts.find(function(person) {
          return person.id === +id;
        });

        $("#editContact #fullName").val(contact.full_name);
        $("#editContact #email").val(contact.email);
        $("#editContact #phone").val(contact.phone_number);
        $("#editContact #tag").val(contact.tags);
        $("#editContact #id").val(contact.id);
        $('#editContact').show('slow');
      },
    });
  },
  deleteContact: function() {
    event.preventDefault();
    var self = this;
    var id = $(event.target).parents('.oneCard').attr('data-id');
    var userResponse = confirm('Do you want to delete the contact');
    if (userResponse) {
      var request = new XMLHttpRequest();
      request.open('DELETE', 'http://localhost:4567/api/contacts/' + id);
      request.send();
      request.addEventListener('load', function() {
        if (request.status === 204) {
          self.contacts = self.contacts.filter(function(person) {
            return person.id !== +id;
          });
          $('#frontPage').find('[data-id=' + id + ']').remove();

          if (!self.contacts.length) {
            $('.cardgroup').children().remove(); // precaution
            $('#messageBox').append(msgTemplate({ message: "No contacts found" }));
          }
        }
      });
    }
  },
  findContacts: function() {
    var search = $(event.target).val();
    var matches = [];
    var searchRegex = new RegExp(search.toLowerCase());
    this.contacts.forEach(function(person) {
      if (searchRegex.test(person.full_name.toLowerCase())) {
        matches.push(person);
      }
    });

    $('.cardgroup').children().remove();
    $('#messageBox').children().remove();

    if (matches.length === 0) {
      var msgstring = "There are no contacts matching the letters ";
      $('#messageBox').append(this.msgBoxTemplate2({ message: msgstring, search: search }));
    } else {
      var contactTagArray = this.generateContactTagArray(matches);
      $('.cardgroup').append(this.ccTemplate({ contacts: contactTagArray }));
    }
  },
  taggedContacts: function() {
    event.preventDefault();
    var tagValue = $(event.target).text();
    var tagged = this.contacts.filter(function(person) {
      var tags = person.tags.split(",");
      return tags.includes(tagValue);
    });

    $('.cardgroup').children().remove();
    var contactTagArray = this.generateContactTagArray(tagged);
    $('.cardgroup').append(this.ccTemplate({ contacts: contactTagArray }));
  },
  generateContactTagArray: function(contacts) {
    if (contacts) {
      return contacts.map(function(person) {
        var newObj = Object.create(person);
        newObj.tags = person.tags.split(',');
        return newObj;
      });
    }

    return this.contacts.map(function(person) {
      var newObj = Object.create(person);
      newObj.tags = person.tags.split(',');
      return newObj;
    });
  },
  renderFrontPage: function() {
    event.preventDefault();
    var form = $(this).parents('#createContact').attr('id') ||
                $(this).parents('#editContact').attr('id');
    $('#' + form).hide({
      complete: function() {
        $('#frontPage').show('slow');
      }
    });
  },
  renderPage: function(cardTemplate, msgTemplate) {
    var self = this;
    var req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:4567/api/contacts');
    req.responseType = 'json';
    req.send();
    req.addEventListener('load', function() {
      if (req.status === 200 && req.response.length > 0) {
        self.contacts = req.response;
        var contactTagArray = self.generateContactTagArray();
        var context = { contacts: contactTagArray };

        $('.cardgroup').append(cardTemplate(context));
      } else {
        $('#messageBox').append(msgTemplate({ message: "No contacts found" }));
      }
    });
  },
  displayLandingPage: function() {
    $('#createContact').hide();
    $('#editContact').hide();
    this.renderPage(this.ccTemplate, this.msgBoxTemplate1);
  },
  compileTemplates: function() {
    this.ccTemplate = Handlebars.compile($('#contactCard').html());
    this.msgBoxTemplate1 = Handlebars.compile($('#msgBox1').html());
    this.msgBoxTemplate2 = Handlebars.compile($('#msgBox2').html());
    Handlebars.registerPartial('msgBoxPartial', $('#msgBoxPartial').html());
  },
  bindEvents: function() {
    $('#frontPage').on('click', '.addContact', $.proxy(this.createContact, this));
    $('.cardgroup').on('click', 'a.editCard', $.proxy(this.editContact, this));
    $('.cardgroup').on('click', 'a.deleteCard', $.proxy(this.deleteContact, this));
    $('.cardgroup').on('click', 'a.badge', $.proxy(this.taggedContacts, this));
    $('#createContact').on('submit', $.proxy(this.addContact, this));
    $('#editContact').on('submit', $.proxy(this.updateContact, this));
    $('#forms').on('click', '[type=button]', this.renderFrontPage);
    $('#searchBar').on('input', $.proxy(this.findContacts, this));
    $('.banner').on('click', $.proxy(this.displayLandingPage, this));
  },
  init: function() {
    this.compileTemplates();
    this.displayLandingPage();
    this.bindEvents();
  },
}

$($.proxy(contactForm.init, contactForm));
