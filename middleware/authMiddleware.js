import jwt from "jsonwebtoken";

// Verify_Admin_Middleware
export const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Admins only" });

    req.user = decoded;
    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Verify_Doctor_Middleware
export const verifyDoctor = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "doctor")
      return res.status(403).json({ message: "Doctors only" });

    req.user = decoded;
    next();
  } catch (err) {
    console.error("verifyDoctor error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
