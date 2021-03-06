const crypto = require('crypto');

require('dotenv').config();

const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');

const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.NODEKEY
  }
}))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
      fname: "",
      lname: ""
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email, password: password
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {

        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email, password: password
          },
          validationErrors: []
        });
      }
      bcrypt.compare(password, user.password).then(isSame => {
        if (isSame) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.isListView = false;
          return req.session.save(err => {
            console.log(err);
            res.redirect('/');
          });
        }
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email, password: password
          },
          validationErrors: []
        });


      }).catch(err => {
        console.log(err);
        res.redirect('/login');
      })

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email, password: password, confirmPassword: confirmPassword,
        fname: fname, lname: lname
      },
      validationErrors: errors.array(),

    });
  }


  bcrypt.hash(password, 12).then(hashedPassword => {
    const user = new User({
      email: email,
      password: hashedPassword,
      fname: fname,
      lname: lname,
      cart: { items: [] }
    });
    return user.save();
  })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: process.env.ADMIN_EMAIL,
        subject: 'sign up',
        html: '<h1>congratulations on signing up for My Pantry!</h1>'
      }).catch(err => {
        console.log(err);
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('error', 'No account with that email found.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000
      return user.save();

    }).then(result => {
      res.redirect('/email-sent');
      transporter.sendMail({
        to: req.body.email,
        from: process.env.ADMIN_EMAIL,
        subject: 'Password Reset',
        html: `
        <p>Your password has been requested to be reset, if you did not do this then ignore this message</p>
        <p>Click this <a href="https://cse-food-app.herokuapp.com/reset/${token}"> link </a> to reset the password </p>
        `
      }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
    })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body._userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { "$gt": Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    }).then(result => {
      res.redirect('/login');
    }).catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getEmailSent = (req, res, next) => {
  res.render('auth/email-sent', {
    path: '/email-sent',
    pageTitle: 'Email Sent!',
  });
};