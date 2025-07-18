const redis = require("../config/redis");

const rateLimitMiddleware = async (req, res, next) => {
  if (!req.user?.userId) {
    console.error("No userId in rateLimitMiddleware");
    return next();
  }
  const userId = req.user.userId;
  const key = `rate-limit:${userId}`;
  try {
    const requests = await redis.get(key);
    if (requests && parseInt(requests) >= 20) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
    await redis.multi().incr(key).expire(key, 3600).exec();
    next();
  } catch (error) {
    console.error("Rate limit error:", error.message);
    next();
  }
};

module.exports = rateLimitMiddleware;
