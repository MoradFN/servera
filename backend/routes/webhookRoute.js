import express from "express";

const router = express.Router();

router.post("/stripe", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

export default router;
