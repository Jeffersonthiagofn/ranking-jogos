export const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "Token de autenticação não fornecido" });
  }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
        return res.status(401).json({ msg: "Token inválido ou expirado" });
    } else {
        req.userId = decoded.id;
        next();
    }
});
}; 