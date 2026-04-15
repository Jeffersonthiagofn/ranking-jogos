export const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token missing or malformed." });
  }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
        return res.status(401).json({ msg: "Token inválido ou expirado" });
    }
    
    req.userId = decoded.id;
    next();

});
}; 