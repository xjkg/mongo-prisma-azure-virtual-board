const express = require("express")
require('dotenv').config()
const app = express()

app.use(express.json())
const PORT = process.env.PORT || 8080


app.post('/test', (req, res) => {
console.log('Received body:', req.body);
res.send({ message: "Test genomfört", body: req.body });
});

app.get('/', (req, res) => {
    res.send("<h1>Hello!</h1>")
    })

app.get('/test', (req, res) => {
    res.send("<h1>Hello test!</h1>")
    })

const usersRouter = require("./routes/users")
app.use("/users", usersRouter)

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
})
