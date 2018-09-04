// Questions:
// is there a method to convert form data directly to json or a url encoded string
// when handling the form submission with JS? (if using method form attribute, query
// string is automatically generated and send as POST body).
//
// the search functionality is on the client side (not server side)
// if search was server side, you would send GET requests and update local
// element with responses.


$(function() {
  console.log('DOM loaded');

  // handlebars compilation
  var contactTemplate = Handlebars.compile($('#contactCard').html());

  // cache current contact list.
  var contacts = [];
  var request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:4567/api/contacts');
  request.send();
  request.addEventListener('load', function() {
    contacts = JSON.parse(request.response); // array of contact objects
    if (contacts.length) {
      $('.card-group .row').append(contactTemplate({ contacts: contacts }));

      // edit Card
      // update contacts array after editing
      $('a.editCard').on('click', function(event) {
        event.preventDefault();
        var id = $(this).parents('.oneCard').attr('data-id');
        console.log(id);
        $('#frontPage').hide({
          complete: function() {
            // show create form page
            // populate the fields inside this form with contact details
            // retrieve contact details with specific id, using another GET request.
            // if user hits submit, then trigger form submission
            // if user hits cancel, then hide current page and return to homepage.

            // iterate through array and find the contact object, based on the id.
            var contact = contacts.find(function(person) {
              return person.id === +id;
            });

            $("#fullName").val(contact.full_name);
            $("#email").val(contact.email);
            $("#phone").val(contact.phone_number);
            $("#tag").val(contact.tags);
            $('#createContact').show('slow');
          },
        });
      });

      // delete Card
      // update contacts array, after deletion
      $('a.deleteCard').on('click', function(event) {
        event.preventDefault();
        var id = $(this).parents('.oneCard').attr('data-id');
        var userResponse = confirm('Do you want to delete the contact');
        if (userResponse) {
          var request = new XMLHttpRequest();
          request.open('DELETE', 'http://localhost:4567/api/contacts/' + id);
          request.send();
          request.addEventListener('load', function() {
            $('#frontPage').find('[data-id=' + id + ']').remove();
            console.log('card removed');
          });
        }
      }); // end of delete

      $('a.badge').on('click', function(event) {
        event.preventDefault();
        console.log('badge clicked!');
      });

    } else {
      $('.addContact').last().parents('.container').show();
    }
  });

  $('#createContact').hide();
  // the below line is executed before load event fires for first XHR request
  $('.addContact').last().parents('.container').hide();

  $('#frontPage').on('click', '.addContact', function(event) {
    event.preventDefault();
    $('#frontPage').hide({
      complete: function() {
        $('#createContact').show('slow');
      }
    });
  });

  $('form').on('submit', function(event) {
    event.preventDefault();
    console.log('form submitted');

    var data = {
      "full_name": $("#fullName").val(),
      "email": $("#email").val(),
      "phone_number": $("#phone").val(),
      "tags": $("#tags").val(),
    };

    // var json = JSON.stringify(data);

    var request = new XMLHttpRequest();
    //request.open('POST', 'http://localhost:4567/api/contacts');
    //request.setRequestHeader('Content-Type', 'application/json');
    //request.send(json);
    request.open('GET', 'http://localhost:4567/api/contacts/8');
    request.send();

    request.addEventListener('load', function() {
      console.log(request.status);
      console.log(request.response);
      $('form').get(0).reset();

      $('#createContact').hide({
        complete: function() {
          $('#frontPage').show('slow');
        },
      });

    });

  }); // end of form event handler

  // search functionality
  //
  // bind an input event
  // retrieve text from the search box
  // no need to send xhr requests, since you've already cached contacts
  // search through contacts array:
  // - compare input value to name property of each object,
  // - create a new array of with id's of matched names
  // - if there are no matches, the display banner saying no matches
  // - if id array is not empty, re-render the page //create new array with ids, for handlebars
  // - remove current contact cards (trigger delete based on id)
  // - update page with new contact cards, rendered with handlebars.
  //
  // every change in input (additional character, or backspace),
  // reruns the search and render process.

  $('#searchBar').on('input', function() {
    var search = $(this).val().toLowerCase();
    var matches = [];
    search = new RegExp(search);
    contacts.forEach(function(person) {
      if (search.test(person.full_name.toLowerCase())) {
        matches.push(person);
      }
    });

    $('.card-group .row').children().remove();

    if (matches.length === 0) {
      // render just a box that says, 'there are no matching contacts'
    } else {
      $('.card-group .row').append(contactTemplate({ contacts: matches }));
    }

  });

  // tagging
  //
  // add tag when creating contact (or editing)
  // display tag as a badge in card group.
  //
  // click event listener on tag, re-render page with contacts with matching tag
});
