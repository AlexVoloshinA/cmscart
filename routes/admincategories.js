const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

/*
Get category model
*/

const Category = require('../models/Category');

router.get('/', async (req,res) => {
  let categories = await Category.find({});
  res.render('admin/categories', {
    categories: categories
  });
});

/*
Get add page index
*/

router.get('/add-category', (req,res) => {
  let title = '';
  let slug = '';
  let content = '';

  res.render('admin/add_category', {
    title: title,
    slug: slug,
    content: content
  });
});

router.post('/add-category', async (req,res) => {
  
  req.checkBody('title', 'title must have a value').notEmpty();
 
  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  
  var errors = req.validationErrors();

  if(errors){
    res.render('admin/add_category', {
      errors: errors,
      title: title
    });
  } else {

    let pageWithSlug = await Category.findOne({slug:slug});
    if(pageWithSlug){
      req.flash('danger', 'Category title exists, choose another');
      res.render('admin/add_category', {
        title: title,
      });
    } else {
      const category = new Category({
        title: title,
        slug: slug
      });
  
      await category.save();
      res.redirect('/admin/categories');
    }
  }
});

/*POST REARDER PAGES */

router.post('/reorder-page', (req,res) => {
  console.log(req.body);
  
});

router.get('/edit-category/:slug', async (req,res) => {
  debugger;
  const category = await Category.findOne({slug: req.params.slug});
  res.render('admin/edit_category', { 
    title: category.title,
    slug: category.slug,
    id: category._id
  });
  
});

router.post('/edit-category/:id', async (req,res) => {
  const cat = await Category.findOne({_id: req.params.id});
  cat.title = req.body.title;

  await cat.save();
  res.redirect('/admin/categories');
  
});

router.get('/delete-category/:slug', async (req,res) => {
  await Category.findOne({slug: req.params.slug}).remove();
  res.redirect('/admin/categories');
});

module.exports = router;