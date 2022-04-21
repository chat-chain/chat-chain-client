let api
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  api = 'http://localhost:5000'
else api = 'https://rest.chat-chain.com'
export { api }
