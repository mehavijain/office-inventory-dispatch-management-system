const express = require("express");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/data", (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        res.json(JSON.parse(data || "[]"));
    } catch (error) {
        res.json([]);
    }
});

app.post("/api/data", (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});




app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
});