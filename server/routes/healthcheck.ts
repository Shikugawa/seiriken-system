import express = require('express');
const router = express.Router();

router.get('/healthcheck', async (req, res) => {
  res.send('it Works!');
});

module.exports = router;