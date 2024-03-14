const jwt = require("jsonwebtoken");

exports.JWTverification = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ msg: "err/missing-token" });
  }

  try {
    const verify = await jwt.verify(token, process.env.JWT_SECRET);

    if (!verify) {
      return res.status(401).json({ msg: "err/missing-token" });
    }

    req.user = verify;
    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};
