const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions = {
    origin: [
        "http://localhost:5173",  // Vite dev server
        /^chrome-extension:\/\/.*$/  // Any Chrome extension
    ],
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json({ message: "Hello World" });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

