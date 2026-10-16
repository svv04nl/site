import { initBotId } from 'botid/client/core'

initBotId({
  protect: [
    { path: '/api/message-submit', method: 'POST' },
    { path: '/api/chat', method: 'POST' },
    { path: '/api/donatie', method: 'POST' },
  ],
})
