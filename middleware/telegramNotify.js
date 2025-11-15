/**
 * Telegram order-success notifier middleware
 * Auto-injected by ChatGPT on 2025-10-31 11:29:21
 * It wraps res.json to watch for success responses and send a Telegram message.
 */
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7562387366:AAE5O-HQtbLkL8t7Zv8027NrLIqMcRp7Ojk";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "5254873680";

function stringifyMoney(v) { 
  if (v == null) return '';
  try { 
    const n = Number(v);
    if (!isNaN(n)) return n.toLocaleString('id-ID');
  } catch (_e) {}
  return String(v);
}

async function sendMessage(text) {
  if (!BOT_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await axios.get(url, { params: { chat_id: CHAT_ID, text } });
  } catch (e) {
    // swallow errors to avoid breaking responses
    console.error('[telegramNotify] sendMessage error:', e?.response?.data || e.message);
  }
}

function extractOrderInfo(payload) {
  // Try common shapes: { order }, { data: { order } }, or root-level fields
  const o = payload?.order || payload?.data?.order || payload?.data || payload || {};
  const user = o.user?.username || o.user?.name || o.username || o.name || payload?.user || '';
  const product = o.product?.name || o.product_name || o.product || o.item?.name || o.item || '';
  const amount = o.amount || o.total || o.price || o.total_amount || o.totalPrice || o.grand_total || payload?.amount;
  return { user, product, amount };
}

function shouldNotify(payload) {
  const flags = [
    payload?.success === true,
    /success|paid|completed|settlement/i.test(String(payload?.status || payload?.payment_status || '')),
  ];
  // Also allow explicit "order" object presence plus HTTP 200-ish implied success
  const hasOrder = !!(payload?.order || payload?.data?.order);
  return flags.some(Boolean) || hasOrder;
}

function buildMessage(payload) {
  const { user, product, amount } = extractOrderInfo(payload);
  const ts = new Date().toLocaleString('id-ID');
  let msg = `✅ Order sukses!\n\n`;
  if (user) msg += `🧍 User: ${user}\n`;
  if (product) msg += `📦 Produk: ${product}\n`;
  if (amount != null) msg += `💰 Total: Rp${stringifyMoney(amount)}\n`;
  msg += `🕒 Waktu: ${ts}`;
  return msg;
}

function telegramNotifier(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    try {
      if (shouldNotify(body)) {
        const text = buildMessage(body);
        await sendMessage(text);
      }
    } catch (e) {
      console.error('[telegramNotify] wrapper error:', e?.message);
    }
    return originalJson(body);
  };
  next();
}

module.exports = { telegramNotifier, sendMessage };