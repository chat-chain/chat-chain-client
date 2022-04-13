let api
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  api = 'http://localhost:5000'
else api = 'http://chat-chain2.eba-wiyucvbu.us-east-1.elasticbeanstalk.com'
export { api }
