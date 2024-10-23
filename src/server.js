const express = require("express")
require('dotenv').config()
const cors = require('cors')
const app = express()

const FRONTEND_URL = 'https://wom-projekt1-hgdyf8h2a0fshuh0.northeurope-01.azurewebsites.net/'

app.use(cors({
    origin: FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}))

app.use(express.json())
const PORT = process.env.PORT || 8080

const usersRouter = require("./routes/users")
app.use("/users", usersRouter)

const boardsRouter = require("./routes/boards")
app.use("/boards", boardsRouter)

const notesRouter = require("./routes/notes")
app.use("/boards/:boardId/notes", notesRouter)

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
})
