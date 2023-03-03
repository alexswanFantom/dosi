const axios = require('axios');
axios.defaults.withCredentials = true;
const cfg = require('./config');
const ora = require('ora');
const fs = require('fs');

async function getEmail(cookie) {
  let status = false;
  try {
    axios.defaults.withCredentials = true;
    const url = "https://wallet.dosi.world/api/v1/user";
    const result = await axios.get(url, {
      headers: { 'cookie': cookie },
      agent: await cfg.getAgent()
    });
    if (result.data.responseCode === '200') {
      status = true;
      let data = { status: status, email: result.data.responseData.email }
      return data
    }
  } catch (err) { let data = { status: status, email: 'undefined' }; return data; }
}

async function checkNFTs(cookie) {
  const accounts = await getEmail(cookie);
  const url = 'https://citizen.dosi.world/api/citizen/v1/membership';
  let status = false;
  const prepare = new ora(`${cfg.color.YELLOW}Geting NFTs for${cfg.color.RESET} ${cfg.color.WHITE}${accounts.email}...${cfg.color.RESET}`).start();
  await cfg.sleep(2000);
  try {
    const result = await axios.get(url, {
      headers: { 'cookie': cookie },
      agent: await cfg.getAgent()
    });
    const count = result.data.nftCount;
    if (result) {
      status = true;
      prepare.stop();
      console.log(`✓ ${cfg.color.BLUE}${accounts.email}${cfg.color.RESET} ${cfg.color.MAGENTA}have ${count} NFTs Traveler.${cfg.color.RESET}`);
    }
  } catch (err) { prepare.stop(); console.log(`${cfg.color.RED} Opps sorry, ${accounts.email} Failed to get NFTs with status: ${status}${cfg.color.RESET}`) }
}

async function getBalance(cookie) {
  const url = "https://citizen.dosi.world/api/citizen/v1/balance";
  let status = false;
  const accounts = await getEmail(cookie);
  const prepare = new ora(`${cfg.color.YELLOW}Geting balance for${cfg.color.RESET} ${cfg.color.WHITE}${accounts.email}...${cfg.color.RESET}`).start();
  await cfg.sleep(2000);
  try {
    const result = await axios.get(url, {
      headers: { 'cookie': cookie },
      agent: await cfg.getAgent()
    });
    if (result) {
      status = true;
      prepare.stop();
      const count = result.data.amount;
      console.log(`✓ ${cfg.color.BLUE}${accounts.email}${cfg.color.RESET} ${cfg.color.MAGENTA}have ${count} DON.${cfg.color.RESET}`);
    }
  } catch (err) {
    prepare.stop();
    console.log(`${cfg.color.RED}Opps sorry, ${accounts.email} Failed to get Balance with status: ${status}${cfg.color.RESET}`)
  }
}

async function getParticipate(cookie) {
  let status = false;
  const accounts = await getEmail(cookie);
  const adv = await getLastAdventures();
  const url = 'https://citizen.dosi.world/api/citizen/v1/adventures/' + adv;
  const prepare = new ora(`${cfg.color.YELLOW}Geting${cfg.color.RESET} ${accounts.email} ${cfg.color.YELLOW}participate adventures...${cfg.color.RESET}`).start();
  await cfg.sleep(2000);
  try {
    const result = await axios.get(url, {
      headers: { 'cookie': cookie },
      agent: await cfg.getAgent()
    });
    if (result) {
      status = true;
      prepare.stop();
      const count = result.data.participation.currentCount;
      console.log(`✓ ${cfg.color.BLUE}${accounts.email}${cfg.color.RESET} ${cfg.color.MAGENTA}was joined ${count} ADVENTUREs.${cfg.color.RESET}`);
    }
  } catch (e) {
    prepare.stop();
    console.log(`✓ ${cfg.color.RED}Opps sorry, ${accounts.email} Failed to get Participate adventures with status: ${status}${cfg.color.RESET}`)
  }
}

async function getParticipates(cookie) {
  let status = false;
  const accounts = await getEmail(cookie);
  const adv = await getLastAdventures();
  const url = 'https://citizen.dosi.world/api/citizen/v1/adventures/' + adv
  try {
    const result = await axios.get(url, {
      headers: { 'cookie': cookie },
      agent: await cfg.getAgent()
    });
    if (result) status = true;
    const count = result.data.participation.currentCount;
    return count;
  } catch (e) { console.log(`✓ ${cfg.color.RED}Opps sorry, ${accounts.email} Failed to get Participate adventures with status: ${status}${cfg.color.RESET}`) }
}

async function dailyLogin(cookies) {
  const accounts = await getEmail(cookies);
  const url = 'https://citizen.dosi.world/api/citizen/v1/events/check-in';
  const _login = async (cookie, callback) => {
    try {
      const result = await axios(url, { method: "POST", headers: { "Cookie": cookie }, agent: await cfg.getAgent() });
      callback(result.data);
    } catch (e) {
      try {
        callback(e.response.data)
      } catch (err) {
        _login(cookies, callback);
        await cfg.sleep(8000);
      }
    }
  }
  _login(cookies, (result) => {
    if ('statusMessage' in result && (result.statusMessage === 'Fail to register check-in event due to check-in is already processed.')) {
      return console.log(`✓ ${cfg.color.WHITE}${accounts.email}${cfg.color.RESET} ${cfg.color.RED}already processed.${cfg.color.RESET}`);
    } else if ('success' in result) {
      return console.log(`✓ ${cfg.color.YELLOW}${accounts.email}${cfg.color.RESET} ${cfg.color.GREEN}success claim.${cfg.color.RESET}`);
    }
  });
}

async function getWallet(cookie) {
  const url = 'https://wallet.dosi.world/api/v1/user/wallet';
  let status = false;
  const accounts = await getEmail(cookie);
  const prepare = new ora(`${cfg.color.YELLOW}Prepare${cfg.color.RESET} ${accounts.email} ${cfg.color.YELLOW}to get wallet address...${cfg.color.RESET}`).start();
  await cfg.sleep(2000);
  try {
    const result = await axios.get(url, {
      headers: { 'Cookie': cookie }
    });
    if (result.data && (result.data.responseCode === '200')) {
      const wallet = result.data.responseData.walletAddress;
      prepare.stop();
      console.log(`✓ ${cfg.color.WHITE}${accounts.email}${cfg.color.RESET} ${cfg.color.YELLOW}${wallet.substring(0, 10)}...${wallet.substring(15, 20)}${cfg.color.RESET}`);
      await appendToFile(wallet);
    }
  } catch (e) {
    prepare.stop();
    console.log(`${cfg.color.RED}Opps sorry, ${accounts.email} Failed to get wallet address with status: ${status}${cfg.color.RESET}`)
  }
}

async function appendToFile(datas) {
  fs.readFile('address.txt', 'utf8', async (err, data) => {
    if (err) return err;
    let address = [];
    const _address = data.split('\n');
    for (let i = 0; i < _address.length; i++) {
      address.push(_address[i]);
    }
    if (address.includes(datas)) {
      return
    } else {
      fs.appendFile('address.txt', `${datas}\n`, (e) => { if (e) throw e });
    }
  });
}

async function participate(cookies) {
  const accounts = await getEmail(cookies);
  const adv = await getLastAdventures();
  const url = `https://citizen.dosi.world/api/citizen/v1/adventures/${adv}/participation`;
  const isEnough = "Fail to participate adventure due to lack of point";
  const join = async (cookie, callback) => {
    try {
      const result = await axios(url, { method: "POST", headers: { "Cookie": cookie } });
      callback(result.data);
    } catch (e) {
      try {
        callback(e.response.data)
      } catch (e) {
        await cfg.sleep(7000);
        return join(cookies, callback)
      }
    }
  }

  join(cookies, async (result) => {
    if ('statusMessage' in result && (result.statusMessage === isEnough)) {
      console.log(`✓ ${cfg.color.RED}${accounts.email} Failed to join adventures ${adv}, insucifient DON.${cfg.color.RESET}`);
    } else if ('result') {
      console.log(`✓ ${cfg.color.MAGENTA}${accounts.email}${cfg.color.RESET} ${cfg.color.GREEN}Success join${cfg.color.RESET} ${result.currentCount} ${cfg.color.GREEN}adventures ${adv}.${cfg.color.RESET}`);
    }
  });
}

async function Toparticipate(cookie) {
  const current = await getParticipates(cookie);
  const adv = await getLastAdventures();
  const accounts = await getEmail(cookie);
  const start = new ora(cfg.color.YELLOW + 'Getting result for ' + accounts.email + '...').start();
  await cfg.sleep(3000)
  if (Number(current) === 0) {
    for (let i = 0; i < 2; i++) {
      start.stop();
      await participate(cookie)
    }
  } else if (Number(current) === 1 || Number(current) < 2) {
    start.stop();
    await participate(cookie);
  } else if (Number(current) === 2 || Number(current) > 2) {
    start.stop();
    console.log(`✓ ${cfg.color.MAGENTA}${accounts.email}${cfg.color.RESET} ${cfg.color.YELLOW}was joined${cfg.color.RESET} ${current} ${cfg.color.YELLOW}adventures ${adv}.${cfg.color.RESET}`);
  }
}

async function getLastAdventures() {
  let status = false;
  const url = 'https://citizen.dosi.world/api/citizen/v1/adventures';
  try {
    const result = await axios.get(url, {});
    if (result) status = true;
    return result.data.adventureList[0].id
  } catch (e) { return status }
}

module.exports = { checkNFTs, getBalance, getParticipate, getParticipates, dailyLogin, getWallet, Toparticipate }