# Telegram Notification Integration

This project was patched to automatically send a Telegram message whenever an API route returns a JSON response indicating a successful order.

## How it works
- Middleware added at `middleware/telegramNotify.js` wraps `res.json`.
- If the response body looks like a success (e.g., `{ success: true }` or `status` is `paid/success/completed`, or contains an `order` object), it sends a message to Telegram.
- Injected into:

- `panel-oto-main/server.js`

## Config
- Uses environment variables when provided:
  - `TELEGRAM_BOT_TOKEN` (default: provided)
  - `TELEGRAM_CHAT_ID` (default: provided)

**Defaults in code right now**
```
BOT_TOKEN = 7562387366:AAE5O-HQtbLkL8t7Zv8027NrLIqMcRp7Ojk
CHAT_ID   = 5254873680
```

> You can override by setting env vars in production.

## Install dependency
This uses `axios`. Install it:
```bash
npm i axios
```

## Manual integration (if not injected automatically)
Add to your express app (e.g., `server.js`, `app.js`, or the file that creates `app`):
```js
const { telegramNotifier } = require('./middleware/telegramNotify');
app.use(telegramNotifier);
```

## Test
Run your server and hit an endpoint that returns e.g.:
```json
{ "success": true, "order": { "user": "alice", "product": "VIP", "amount": 50000 } }
```
You should receive a Telegram message at chat `5254873680`.
