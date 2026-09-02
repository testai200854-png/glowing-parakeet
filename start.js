const { spawn, execSync } = require('child_process');

const PORT = '3100';

function freePort(port) {
  try {
    execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { stdio: 'ignore' });
  } catch (error) {
    // Ignore if fuser is unavailable or no process is using the port.
  }
}

function startServer() {
  const server = spawn('node', ['server.js'], {
    env: {
      ...process.env,
      PORT,
      HOST: '0.0.0.0',
      // Codespaces terminates HTTPS at its forwarding proxy.
      USE_HTTPS: 'false'
    },
    stdio: 'inherit'
  });

  server.on('exit', (code, signal) => {
    if (signal) {
      console.log(`server.js exited from signal: ${signal}. Restarting...`);
    } else if (code !== 0) {
      console.log(`server.js exited with code ${code}. Restarting...`);
    } else {
      console.log('server.js exited cleanly.');
      return;
    }

    setTimeout(() => {
      freePort(PORT);
      startServer();
    }, 1000);
  });
}

freePort(PORT);
startServer();
