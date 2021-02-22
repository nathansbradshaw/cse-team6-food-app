

exports.getIndex = (req, res, next) => {
      res.render('main/index', {
        pageTitle: 'main',
        path: '/'
    })
    .catch(err => {
      console.log(err);
    });
};

