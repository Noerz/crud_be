const { registerUser, loginUser } = require("../services/authService");

// Helper to avoid repetitive try/catch in each controller
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const Register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const newUser = await registerUser({ fullName, email, password });
  res.status(201).json({
    code: 201,
    status: "success",
    message: "User registered successfully",
    data: newUser,
  });
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
