const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith("Bearer ")) 
    ? authHeader.split(" ")[1] 
    : req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id, email, role etc.
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden access: Invalid token" });
  }
};

module.exports = verifyToken;
