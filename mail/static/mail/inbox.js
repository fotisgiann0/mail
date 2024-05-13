document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
     
    emails.forEach(email => {
        const element = document.createElement('div');
        if(mailbox == 'sent') {
          element.innerHTML = `<b>${email.recipients}</b>                  ${email.subject}                    ${email.timestamp}`;
        } else {
          element.innerHTML = `<b>${email.sender}</b>                  ${email.subject}                    ${email.timestamp}`;
        }
       
        element.addEventListener('click', function() {show_email(email.id, mailbox)})
        if (email.read) {
          element.style.backgroundColor = 'lightgrey';
        }
        document.querySelector('#emails-view').append(element);
        document.querySelector('#emails-view').appendChild(document.createElement("br"));
      });
      
  });

}

function send_mail() {
  const compose_form = document.querySelector('#compose-form');
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: compose_form["compose-recipients"].value,
        subject: compose_form["compose-subject"].value,
        body: compose_form["compose-body"].value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      load_mailbox('sent');
      console.log(result);
  })
  //load_mailbox('sent')
  return false;

}

function show_email(id, mailbox) {

  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = "";

  fetch('/emails/'+id)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      //console.log(emails)
      make_read(id)
      const element = document.createElement('div');
      element.innerHTML = `<b>From:</b> ${emails.sender} <br> <b>To:</b> ${emails.recipients[0]} <br> <b>Subject:</b> ${emails.subject} <br> <b>Timestamp:</b> ${emails.timestamp} <br> <hr> ${emails.body} <hr>`;
      document.querySelector('#email-view').append(element);
      if(mailbox !== 'sent') {
        const but = document.createElement('button');
        let arch = "Archive";
        if(emails.archived === true) {
          arch = "Unarchive";
        }
        but.innerHTML = `${arch}`;
        but.addEventListener('click', () => {change_arch(id, emails.archived)});
        but.className = "btn btn-outline-primary";
        document.querySelector('#email-view').append(but); 
        const reply = document.createElement('button');
        reply.innerHTML = "Reply";
        reply.addEventListener('click', () => {compose_reply(emails)});
        reply.className = "btn btn-outline-primary";
        document.querySelector('#email-view').append(reply);
      }
     
  });
 
}
function change_arch(id, cur_arch) {
  fetch('/emails/'+id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !cur_arch
    })
  }).then(() => load_mailbox('inbox'));
  
}
function make_read(id) {
  fetch('/emails/'+id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}
 
function compose_reply(email) {

  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  
  document.querySelector('#compose-recipients').value = email.sender;
  if(email.subject.charAt(0) === "R" && email.subject.charAt(1) === "e" && email.subject.charAt(2) === ":") {
    document.querySelector('#compose-subject').value = email.subject;
  } else {
    document.querySelector('#compose-subject').value = 'Re: '+email.subject;
  }
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}` ;


}