const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
const { username, password } = req.body;
const hash = await bcrypt.hash(password, 10);
const user = new User({ username, password: hash });
await user.save();
res.json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
const { username, password } = req.body;
const user = await User.findOne({ username });
if (!user || !(await bcrypt.compare(password, user.password))) {
return res.status(401).json({ message: "Invalid credentials" });
}
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
res.json({ token });
});

router.get("/protected", verifyToken, (req, res) => {
res.json({ message: "Selamat Menjalani Hari Yang Indah" });
});

function verifyToken(req, res, next) {
const auth = req.headers.authorization;
if (!auth) return res.status(403).json({ message: "No token" });
const token = auth.split(" ")[1];
try {
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = payload;
next();
} catch {
return res.status(401).json({ message: "Invalid token" });
}
}

module.exports = router;