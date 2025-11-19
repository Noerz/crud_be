const { registerUser, loginUser } = require("../services/authService");
const { asyncHandler } = require("../middleware/errorHandler");

const Register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const result = await registerUser({ fullName, email, password });
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  res.status(200).json({
    code: 200,
    status: "success",
    message: "Login successful",
    data: result,
  });
});

module.exports = { Register, login };
