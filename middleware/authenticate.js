const User = require("../model/userSchema");
const jwt = require("jsonwebtoken");

const Authenticate = async (req, res, next) => {
  // 62760d89cb830c75f6a5a221
  // 62760da0cb830c75f6a5a224
  try {
    const token = req.cookies.jwtokenport;
    if(!token) {
        req._id = -1;
        next();
        return;
    };
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    // console.log(verifyToken);

    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    // console.log(rootUser);

    if (!rootUser) console.log("User not found");

    req.token = token;
    req.rootUser = rootUser;
    req._id = verifyToken._id;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ err: "Something wrong" });
  }
};

module.exports = Authenticate;
