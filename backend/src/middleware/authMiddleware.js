import jwt from 'jsonwebtoken';

const verifyAccessToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid Token' });
      }
      req.user = decoded;  
      next();  
    });
  } catch (err) {
    return res.status(401).json({ message: 'Access token expired or invalid' });
  }
};

export { verifyAccessToken };  
