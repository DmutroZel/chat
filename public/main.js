//  const socket = io();

//       const form = document.getElementById('form');
//       const input = document.getElementById('input');

//       form.addEventListener('submit', (e) => {
//         e.preventDefault();
//         if (input.value) {
//           socket.emit('chat message', input.value);
//           input.value = '';
//         }
//       });

//       socket.on('chat message', (msg) => {
//         const item = document.createElement('li');
//         item.textContent = msg;
//         document.getElementById('messages').appendChild(item);
//         window.scrollTo(0, document.body.scrollHeight);
//       });
const socket = io();
const clientId = 'user_' + Math.random().toString(36).substr(2, 9);

socket.on('onlineUsers', function(count) {
  $('#online-count').text(count);
});

$(document).ready(function() {
  
  const savedColor = localStorage.getItem('chatThemeColor');
  if (savedColor) {
    applyColorTheme(savedColor);
    $('#color-picker').val(savedColor);
  }
  
  
  $(document).one('click', enableSound);
  
  
  $('#input').focus();
});

function enableSound() {
  $('#message-sound')[0].muted = false;
  console.log("Sound enabled");
}

$('#form').on('submit', function(e) {
  e.preventDefault();
  const inputVal = $('#input').val().trim();
  if (inputVal) {
    socket.emit('chat message', {
      text: inputVal,
      sender: clientId
    });
    
    playMessageSound('send');
    $('#input').val('');
  }
});

socket.on('chat message', function(msg) {
  const $item = $('<li>');
  
  if (msg.sender === clientId) {
    $item.addClass('self');
  } else {
    playMessageSound('receive');
  }
  
  $item.text(msg.text);
  $('#messages').append($item);
  
  window.scrollTo(0, document.body.scrollHeight);
});

function playMessageSound(type) {
  const $messageSound = $('#message-sound');
  
  if ($messageSound[0].muted) {
    console.log("Sound is blocked by browser. User interaction needed.");
    return;
  }
  
  const soundPath = './sounds/fart-with-reverb-39675.mp3';
  $messageSound.attr('src', soundPath);
  
  console.log(`Attempting to play sound (${type})...`);
  $messageSound[0].currentTime = 0;
  
  $messageSound[0].play()
    .then(() => console.log(`Sound ${type} played successfully!`))
    .catch(err => {
      console.error(`Error playing ${type} sound:`, err);
      console.log("Audio state:", $messageSound[0].readyState);
    });
}

$('#color-picker').on('input', function() {
  const color = $(this).val();
  applyColorTheme(color);
  localStorage.setItem('chatThemeColor', color);
});

function applyColorTheme(color) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const isDarkTheme = brightness < 128;
  
  const root = $(':root');
  
  root.css({
    '--primary-light': color,
    '--primary-light-rgb': `${r}, ${g}, ${b}`,
    '--primary-background': color,
    '--form-background': `rgba(${r}, ${g}, ${b}, 0.9)`,
    '--control-background': `rgba(${r}, ${g}, ${b}, 0.8)`,
    '--is-dark-theme': isDarkTheme ? 1 : 0
  });
  
  if (isDarkTheme) {
    root.css({
      '--dark-color': 'rgba(255, 255, 255, 0.9)',
      '--dark-color-solid': '#ffffff',
      '--dark-color-hover': '#f0f0f0',
      '--text-on-dark': '#000000',
      '--text-on-light': '#ffffff'
    });
  } else {
    root.css({
      '--dark-color': 'rgba(0, 0, 0, 0.8)',
      '--dark-color-solid': '#000000',
      '--dark-color-hover': '#333333',
      '--text-on-dark': '#ffffff',
      '--text-on-light': '#000000'
    });
  }
  
  updateExistingMessages(isDarkTheme, r, g, b);
}

function updateExistingMessages(isDarkTheme, r, g, b) {
  $('#messages li.self').css({
    'background-color': `rgba(${r}, ${g}, ${b}, 0.9)`,
    'color': isDarkTheme ? '#ffffff' : '#000000'
  });
  
  $('#messages li:not(.self)').css({
    'background-color': isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
    'color': isDarkTheme ? '#000000' : '#ffffff'
  });
}