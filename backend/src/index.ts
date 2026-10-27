import express from 'express'

const port = Number(process.env.PORT ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

const app = express()

app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

const server = app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})

function shutdown(): void {
  server.close((error) => {
    if (error) {
      console.error(error)
      process.exitCode = 1
    }
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
