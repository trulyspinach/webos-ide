import * as fit from 'xterm/lib/addons/fit/fit';

// Terminal.applyAddon(fit);

  terminado.apply(Terminal);
  // fullscreen.apply(Terminal);
  // Terminal.applyAddon(fullscreen);  // Apply the `fullscreen` addon

  var term = new Terminal(),
	  protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://',
	  socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + "/websocket";
	  sock = new WebSocket(socketURL);

  sock.addEventListener('open', function () {
	term.terminadoAttach(sock);
  });

  term.open(document.getElementById('terminal-container'));
  // term.fit();
  // term.toggleFullScreen();
