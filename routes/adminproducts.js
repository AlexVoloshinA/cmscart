const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const resizeImg = require('resize-img');
/*
Get products index
*/

router.get('/', async (req, res) => {
  let count;

  count = await Product.countDocuments();

  let products = await Product.find({});
  res.render('admin/products', {
    products: products,
    count: count
  });
});

/*
Get add page index
*/

router.get('/add-product', async (req, res) => {
  let title = '';
  let desc = '';
  let price = '';

  let categories = await Category.find();

  res.render('admin/add_product', {
    title: title,
    desc: desc,
    categories: categories,
    price: price
  });
});

router.post('/add-product', async (req, res) => {

  var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";

  req.checkBody('title', 'title must have a value').notEmpty();
  req.checkBody('desc', 'Description must have a value').notEmpty();
  req.checkBody('price', 'Price must have a value').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
    let categories = await Category.find();

    res.render('admin/add_product', {
      errors: errors,
      title: title,
      desc: desc,
      categories: categories,
      price: price
    });
  } else {

    let productWithSlug = await Product.findOne({ slug: slug });
    if (productWithSlug) {
      req.flash('danger', 'Product title exists, choose another');
      let categories = await Category.find();

      res.render('admin/add_product', {
        title: title,
        desc: desc,
        categories: categories,
        price: price
      });
    } else {
      var price2 = parseFloat(price).toFixed(2);
      const product = new Product({
        title: title,
        slug: slug,
        desc: desc,
        price: price2,
        category: category,
        image: imageFile
      });

      await product.save();

      mkdirp('public/product_images/' + product._id, function (err) {
        return console.log(err);
      });

      mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
        return console.log(err);
      });

      mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
        return console.log(err);
      });

      if (imageFile != "") {
        var productImage = req.files.image;
        var path = 'public/product_images/' + product._id + '/' + imageFile;

        productImage.mv(path, function (err) {
          return console.log(err);
        });
      }
      res.redirect('/admin/products');
    }
  }
});



router.get('/edit-product/:id', async (req, res) => {
  let errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  let categories = await Category.find();

  let product = await Product.findById(req.params.id);

  let galleryDir = 'public/product_images/' + product._id + '/gallery';
  let galleryImages = null;

  fs.readdir(galleryDir, function (err, files) {
    if (err) {
      console.log(err);
    }
    else {
      galleryImages = files;

      res.render('admin/edit_product', {
        title: product.title,
        errors: errors,
        desc: product.desc,
        categories: categories,
        category: product.category.replace(/\s+/g, '-').toLowerCase(),
        price: parseFloat(product.price).toFixed(2),
        image: product.image,
        galleryImages: galleryImages,
        id: product._id
      });

    }
  })




});

/*
POST edit product
*/

router.post('/edit-product/:id', async (req, res) => {
  var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";
  req.checkBody('title', 'title must have a value').notEmpty();
  req.checkBody('desc', 'Description must have a value').notEmpty();
  req.checkBody('price', 'Price must have a value').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;
  var pimage = req.body.pimage;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect('/admin/products/edit-product/' + id);
  } else {
    let p = await Product.findOne({ slug: slug, _id: { '$ne': id } });
    if (p) {
      req.flash('danger', 'Product title exists, choose another.');
      res.redirect('/admin/products/edit-product/' + id);
    } else {
      let p = await Product.findById(id);
      p.title = title;
      p.slug = slug;
      p.desc = desc;
      p.price = parseFloat(price).toFixed(2);
      p.category = category;
      if (imageFile != "") {
        p.image = imageFile;
      }

      await p.save();

      if (imageFile != "") {
        if (pimage != "") {
          fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
            if (err) {
              console.log(err);
            }
          });
        }

        var productImage = req.files.image;
        var path = 'public/product_images/' + id + '/' + imageFile;

        productImage.mv(path, function (err) {
          return console.log(err);
        });
      }

      res.redirect('/admin/products/edit-product/' + id);
    }

  }

});

// POST DELETE PRODUCT

router.post('/product-gallery/:id', async (req, res) => {
  var productImage = req.files.file;
  var id = req.params.id;
  let path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
  let thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

  productImage.mv(path, function (err) {
    if (err) console.log(err);

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(function (buf) {
      fs.writeFileSync(thumbsPath, buf);
    });
  });

  res.sendStatus(200);

});

router.get('/delete-page/:id', async (req, res) => {
  await Page.findById(req.params.id).remove();
  res.redirect('/admin/pages');
});

router.get('/delete-image/:image', async (req, res) => {

  let orImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
  let thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

  fs.remove(orImage, (err) => {
    if (err) {
      console.log(err);
    } else {
      fs.remove(thumbImage, function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/admin/products/edit-product/' + req.query.id);
        }
      });
    }
  });
});

router.get('/delete-product/:id', async (req, res) => {

  var id = req.params.id;
  var path = 'public/product_images/' + id;

  fs.remove(path, async (err) => {
    if (err) {
      console.log(err);
    } else {
      await Product.findByIdAndRemove(id);
      res.redirect('/admin/products');
    }
  });
});


module.exports = router;