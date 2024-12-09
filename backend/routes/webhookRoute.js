import express from "express";

const router = express.Router();

router.post("/stripe", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

// router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
