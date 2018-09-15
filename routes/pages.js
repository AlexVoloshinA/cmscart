const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

router.get('/',async (req, res) => {
  let page = await Page.findOne({ slug: 'home' });
 
    res.render('index', {
      title: page.title,
      content: page.content
    });
  

});

router.get('/:slug', async (req, res) => {
  let slug = req.params.slug;

  let page = await Page.findOne({ slug: slug });
  if (!page) res.redirect('/');
  else {
    res.render('index', {
      title: page.title,
      content: page.content
    });
  }

});


module.exports = router;