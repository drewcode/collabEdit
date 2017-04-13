
var sendxhr;
var count=0;
var messageInput;
document.addEventListener("DOMContentLoaded", function(event) {
	inactivityTime();
  sendxhr=new XMLHttpRequest();
  var count = 0;
	messageInput = document.getElementById('box');
	messageInput.addEventListener('keypress', function(e){
       	    
      e.preventDefault();
      var prev = messageInput.selectionEnd;


      console.log("Data Sending : "+prev);
      if(e.key=="Enter") {
      	insertAtCursor(messageInput,'\n');
      }
      else {
      	insertAtCursor(messageInput,e.key);
      }
      count++;
      console.log("Sending Data");
      var message = messageInput.value;
      if (!message) {
        return;
      }
      console.log(JSON.stringify({message: message}));
      if(count % 3 == 0) {
        datasend(JSON.stringify({message: message}));
      }
      
    });
});



function insertAtCursor(myField, myValue) {
    var prev = myField.selectionEnd;
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }

    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
    myField.setSelectionRange(prev + 1, prev + 1);
}
  
var source = new EventSource('/event');
source.addEventListener('message',function(e){
	messageInput.focus();
	var prev = parseInt(messageInput.selectionEnd, 10);

  console.log("Data Recieved : "+prev);
	msg = JSON.parse(e.data);
	messageInput.value = msg.message;

  var pr = parseInt(messageInput.selectionEnd);

  console.log("Data Recieved : "+pr);
	messageInput.focus();
	messageInput.setSelectionRange(prev,prev);
});

function datasend(data){
	sendxhr.open('POST','/message',true);
	sendxhr.setRequestHeader('Content-Type', 'application/json');
	sendxhr.send(data);
}
  
function inactivityTime() {
    var t, sleeping = false;
    window.onload = resetTimer;  
    document.onmousemove = resetTimer;

    function logout() {
      sleeping = true;
      console.log("Sleeping client");
      xhr=new XMLHttpRequest();
      xhr.open('GET','/sleep',true);
      xhr.send();
    }

    function resetTimer() {
      if(sleeping) {
        console.log("Un - Sleeping client");
        xhr=new XMLHttpRequest();
        xhr.open('GET','/unsleep',true);
        xhr.send();
        sleeping = false;
      }

        clearTimeout(t);
        t = setTimeout(logout, 10000)
    }
};  



/*
document.addEventListener("DOMContentLoaded", function(event) {
	sendxhr=new XMLHttpRequest();
	sync(); 
	});
var oldmessage='';
function sync()
{
	console.log("Sync");
	messageInput = document.getElementById('box');
	var message = messageInput.value;
      if (message!==oldmessage) {
      	console.log(JSON.stringify({message: message}));
      	datasend(JSON.stringify({message: message}));
      	oldmessage=messageInput.value;
      }
      
      setTimeout(sync,2000);
}*/
  