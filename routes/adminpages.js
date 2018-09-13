const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

/*
Get pages index
*/

router.get('/', async (req,res) => {
  let pages = await Page.find({}).sort({sorting: 1}).exec();
  res.render('admin/pages', {
    pages: pages
  });
});

/*
Get add page index
*/

router.get('/add-page', (req,res) => {
  let title = '';
  let slug = '';
  let content = '';

  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content
  });
});

router.post('/add-page', async (req,res) => {
  
  req.checkBody('title', 'title must have a value').notEmpty();
  req.checkBody('content', 'content must have a value').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;

  var errors = req.validationErrors();

  if(errors){
    res.render('admin/add_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {

    let pageWithSlug = await Page.findOne({slug:slug});
    if(pageWithSlug){
      req.flash('danger', 'Page slug exists, choose another');
      res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
      });
    } else {
      const page = new Page({
        title: title,
        slug: slug,
        content: content,
        sorting: 100
      });
  
      await page.save();
      res.redirect('/admin/pages');
    }

    
    
  }

  
});

/*POST REARDER PAGES */

router.post('/reorder-page', (req,res) => {
  console.log(req.body);
  
});

module.exports = router;