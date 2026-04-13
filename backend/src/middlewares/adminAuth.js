export const requireAdminSecret = (req, res, next) => {
    const clientSecret = req.headers['x-admin-secret'];
    
    if (clientSecret && clientSecret === process.env.ADMIN_SECRET) {
        return next(); 
    }
    
    console.warn(`Unauthorized attempt to access admin routes from IP: ${req.ip}`);
    return res.status(403).json({ error: "Access denied. Invalid admin secret." });
};