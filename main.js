const fs = require('fs');
const cfg = require('./config');
const ora = require('ora');
const func = require('./funct');
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

async function loadScript() {
  console.clear();
  readline.question(cfg.question, async (count) => { await answer(count); readline.close(); })
}

async function answer(count) {
  fs.readFile('cookie.txt', 'utf8', async (err, data) => {
    if (err) return err;
    const _cookie = data.split('\n');
    const chooice = cfg.chooice[count - 1];
    const Loading = new ora(`${cfg.color.MAGENTA}Loading to ${chooice}...${cfg.color.RESET}`);
    Loading.start();
    await cfg.sleep(5000);
    Loading.stop();
    for (let i = 0; i < _cookie.length; i++) {
      const cookie = _cookie[i];
      if (count === '3') {
        await func.checkNFTs(cookie);
      }
      if (count === '4') {
        await func.getBalance(cookie);
      }
      if (count === '2') {
        await func.dailyLogin(cookie);
      }
      if (count === '5') {
        await func.getParticipate(cookie);
      }
      if (count === '6') {
        await func.getWallet(cookie);
      }
      if (count === '1') {
        await func.Toparticipate(cookie);
      }
    }
  });
}

loadScript()