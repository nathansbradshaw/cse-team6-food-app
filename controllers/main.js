const Item = require('../models/item');


exports.getIndex = (req, res, next) => {
  res.render('main/index', {
    pageTitle: 'My Pantry | Home',
    path: '/'
  })
};

