// Run only during the planned production cutover, or against a separate test bot.
(async()=>{
  const {TELEGRAM_BOT_TOKEN:token,TELEGRAM_WEBHOOK_SECRET:secret,TELEGRAM_WEBHOOK_URL:url}=process.env;
  if(!token || !secret || !/^[A-Za-z0-9_-]{32,256}$/.test(secret) || !url || new URL(url).protocol!=='https:')throw Error('Set token, HTTPS webhook URL, and a 32–256 character webhook secret.');
  const r=await fetch('https://api.telegram.org/bot'+token+'/setWebhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,secret_token:secret,allowed_updates:['message']}),signal:AbortSignal.timeout(10000)});
  const data=await r.json();if(!r.ok||!data.ok)throw Error('Telegram rejected webhook configuration.');
  console.log('Telegram webhook configured successfully.');
})().catch(()=>{console.error('Webhook setup failed. Check the secure environment variables and Telegram access.');process.exitCode=1;});
