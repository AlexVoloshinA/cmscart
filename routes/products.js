const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/',async (req, res) => {
  let products = await Product.find({});
 
    res.render('all_products', {
      title: 'All products',
      products: products
    });
  

});

// router.get('/:slug', async (req, res) => {
//   let slug = req.params.slug;

//   let page = await Page.findOne({ slug: slug });
//   if (!page) res.redirect('/');
//   else {
//     res.render('index', {
//       title: page.title,
//       content: page.content
//     });
//   }

// });


module.exports = router;