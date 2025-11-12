const express = require('express');
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 5000;

const path = require("path");
const filePath = path.join(__dirname, "Bank_Data.json");
app.use(express.json());


const readData = () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.get("/data", (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error reading file", details: err.message });
  }
});
app.get("/data/:name", (req, res) => {
  try {
    const data = readData();

    const nameParam = req.params.name.toLowerCase();

    // Match by name (case-insensitive)
    const item = data.find((i) => i.name.toLowerCase() === nameParam);

    if (!item) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Error reading file", details: err.message });
  }
});

app.post("/data", (req, res) => {
  try {
    const data = readData();

    // Validate: must have at least a name
    if (!req.body.name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newItem = { ...req.body }; // no id, matches your JSON structure
    data.push(newItem);

    writeData(data);

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Error writing data", details: err.message });
  }
});




app.delete("/data/delete/:name", (req, res) => {
  let data = readData();
  const newData = data.filter((i) => i.name !== req.params.name);

  if (data.length === newData.length) {
    return res.status(404).json({ message: "Item not found" });
  }

  writeData(newData);
  res.json({ message: "Item deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});