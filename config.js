const axios = require("axios");
const https = require("https");
axios.defaults.withCredentials = true;
const readline = require('readline');

const color = {
  BLACK: "\u001b[30m",
  RED: "\u001b[31m",
  GREEN: "\u001b[32m",
  YELLOW: "\u001b[33m",
  BLUE: "\u001b[34m",
  MAGENTA: "\u001b[35m",
  CYAN: "\u001b[36m",
  WHITE: "\u001b[37m",
  RESET: "\u001b[0m",
};

async function getAgent() {
  try { 
    const proxy = { protocol: 'http',host: 'proxy.scrapingbee.com',port: 8886,auth: { username: process.env.apiKey,password: 'render_js=False&premium_proxy=True'} };
    const result = await axios.get('https://api.ipify.org/?format=json', { proxy: proxy });
    const options = { localAddress: result.data.ip, keepAlive: true };
    const httpsAgent = new https.Agent(options);
    return httpsAgent
  } catch (e) { return }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const question = `${color.YELLOW}HELLO WELCOME TO DOSIBOT!!${color.RESET}\n${color.YELLOW}Please select the number action of you want to process.${color.RESET}\n\n[1] ${color.MAGENTA}JOIN ADVENTUREs${color.RESET}\n[2] ${color.MAGENTA}DAILY LOGIN${color.RESET}\n[3] ${color.MAGENTA}CHECK NFTs${color.RESET}\n[4] ${color.MAGENTA}CHECK BALANCEs${color.RESET}\n[5] ${color.MAGENTA}CHECK JOINED ADVENTUREs${color.RESET}\n[6] ${color.MAGENTA}GET WALLET ADDRESS${color.RESET}\n\n${color.BLUE}ANSWER:${color.RESET} `;

const chooice = ['JOIN ADVENTUREs', 'DAILY LOGIN', 'CHECK NFTs', 'CHECK BALANCEs', 'CHECK JOINED ADVENTUREs', 'GET WALLET ADDRESS']

module.exports = { color, sleep , getAgent, question, chooice };
