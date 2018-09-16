var contactForm = {
  addContact: function() {
    event.preventDefault();

    let data = {
      "full_name": $("#fullName").val(),
      "email": $("#email").val(),
      "phone_number": $("#phone").val(),
      "tags": $("#tag").val(),
    };

    let self = this;
    $.ajax({
      url: 'http://localhost:4567/api/contacts',
      method: 'POST',
      data: data,
      success: function() {
        $('#createContact').hide({
          complete: function() {
            self.updateContactList();
          },
        });
      },
    });
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
    let self = this;
    let data = {
      "full_name": $("#editContact #fullName").val(),
      "email": $("#editContact #email").val(),
      "phone_number": $("#editContact #phone").val(),
      "tags": $("#editContact #tag").val(),
    };

    let id = $("#editContact #id").val();

    $.ajax({
      url: 'http://localhost:4567/api/contacts/' + id,
      method: 'PUT',
      data: data,
      success: function() {
        $('#editContact').hide({
          complete: function() {
            self.updateContactList();
          }
        });
      },
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
    $('#frontPage').hide({
      complete: function() {
        $('#createContact').show('slow');
      }
    });
  },
  editContact: function() {
    event.preventDefault();
    let self = this;
    let id = $(event.target).parents('.oneCard').attr('data-id');
    $('#frontPage').hide({
      complete: function() {
        let contact = self.contacts.find(person => person.id === +id);

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
    let self = this;
    let id = $(event.target).parents('.oneCard').attr('data-id');
    let userResponse = confirm('Do you want to delete the contact');
    if (userResponse) {
      $.ajax({
        url: 'http://localhost:4567/api/contacts/' + id,
        method: 'DELETE',
        success: function() {
          self.contacts = self.contacts.filter(person => person.id !== +id);
          $('#frontPage').find('[data-id=' + id + ']').remove();
          if (!self.contacts.length) {
            $('.cardgroup').children().remove(); // precaution
            $('#messageBox').append(msgTemplate({ message: "No contacts found" }));
          }
        },
      });
    }
  },
  findContacts: function() {
    let search = $(event.target).val();
    let matches = [];
    let searchRegex = new RegExp(search.toLowerCase());
    this.contacts.forEach(person => {
      if (searchRegex.test(person.full_name.toLowerCase())) {
        matches.push(person);
      }
    });

    $('.cardgroup').children().remove();
    $('#messageBox').children().remove();

    if (matches.length === 0) {
      let msgstring = "There are no contacts matching the letters ";
      $('#messageBox').append(this.msgBoxTemplate2({ message: msgstring, search: search }));
    } else {
      let contactTagArray = this.generateContactTagArray(matches);
      $('.cardgroup').append(this.ccTemplate({ contacts: contactTagArray }));
    }
  },
  taggedContacts: function() {
    event.preventDefault();
    let tagValue = $(event.target).text();
    let tagged = this.contacts.filter(function(person) {
      let tags = person.tags.split(",").map(tag => tag.trim());
      return tags.includes(tagValue);
    });

    $('.cardgroup').children().remove();
    let contactTagArray = this.generateContactTagArray(tagged);
    $('.cardgroup').append(this.ccTemplate({ contacts: contactTagArray }));
  },
  generateContactTagArray: function(contacts) {
    if (contacts) {
      return contacts.map(person => {
        let newObj = Object.create(person);
        newObj.tags = person.tags.split(',').map(tag => tag.trim());
        return newObj;
      });
    }

    return this.contacts.map(person => {
      let newObj = Object.create(person);
      newObj.tags = person.tags.split(',').map(tag => tag.trim());
      return newObj;
    });
  },
  renderFrontPage: function() {
    event.preventDefault();
    let form = $(this).parents('#createContact').attr('id') ||
                $(this).parents('#editContact').attr('id');
    $('#' + form).hide({
      complete: function() {
        $('#frontPage').show('slow');
      }
    });
  },
  renderPage: function(...templates) {
    let self = this;
    $.ajax({
      url: 'http://localhost:4567/api/contacts',
      method: 'GET',
      dataType: 'json',
      success: function(json) {
        self.contacts = json;
        if (json.length) {
          let contactTagArray = self.generateContactTagArray();
          let context = { contacts: contactTagArray };
          $('.cardgroup').append(templates[0](context));
        } else {
          $('#messageBox').append(templates[1]({ message: "No contacts found" }));
        }
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
