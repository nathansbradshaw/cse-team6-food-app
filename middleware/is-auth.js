module.exports = (req, res, next) => {
   // TODO: Check if user is logged in
   // if(!req.session.isLoggedIn) {
   //    return res.redirect('/login');
   // }
   next();
}