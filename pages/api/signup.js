export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    error: "Gone",
    message: "This endpoint has been removed. Use /signup to create an account.",
  });
}
