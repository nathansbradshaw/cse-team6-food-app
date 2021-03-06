const Item = require('../models/item');

const { validationResult } = require('express-validator');

exports.getAddItem = (req, res, next) => {
   res.render('item/edit-item', {
      pageTitle: 'MyPantry | Add Pantry Item',
      path: '/item/add-item',
      editing: false,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
   })
};

exports.getItems = (req, res, next) => {
   // TODO: get item by user
   Item.find({ userId: req.user._id }).then(items => {
      return res.render('item/items', {
         pageTitle: 'MyPantry | Pantry',
         path: '/item/items',
         items: items

      })
   }).catch(error => {
      console.log(error)
   })

};


exports.postAddItem = (req, res, next) => {
   const date = Date();
   const itemName = req.body.itemName;
   const itemExp = req.body.itemExp;
   const dateAdded = date; //This is 
   const quantity = req.body.quantity;
   const description = req.body.description;
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).render('item/edit-item', {
         pageTitle: 'MyPantry | Add Pantry',
         path: '/item/edit-item',
         editing: false,
         hasError: true,
         item: {
            itemName: itemName,
            itemExp: itemExp,
            quantity: quantity,
            description: description,
         },
         errorMessage: errors.array()[0].msg,
         validationErrors: errors.array(),
      });
   }

   const item = new Item({
      itemName: itemName,
      itemExp: itemExp,
      quantity: quantity,
      description: description,
      dateAdded: dateAdded,
      userId: req.user
   });
   item
      .save()
      .then(result => {
         // console.log(result);
         console.log('Created Item');
         res.redirect('/item/items');
      })
      .catch(err => {
         const error = new Error(err);
         error.httpStatusCode = 500;
         return next(error);
      });
};
// ----------------------------------------------------------------------EDIT ITEMS-
exports.getEditItem = (req, res, next) => {
   const editMode = req.query.edit;
   if (!editMode) {
     return res.redirect('/');
   }
   const itemId = req.params.itemId;
   Item.findById(itemId).then(item => {
       if (!item) {
         return res.redirect('/');
       }
       res.render('item/edit-item', {
         pageTitle: 'MyPantry | Edit Pantry Item',
         path: '/item/edit-item',
         editing: editMode,
         item: item,
         hasError: false,
         errorMessage: null,
         validationErrors: [],
       });
     })
     .catch(err => {
       const error = new Error(err);
       error.httpStatusCode = 500;
       return next(error);
     });
 };
 
 exports.postEditItem = (req, res, next) => {
   const itemId = req.body.itemId;
   const updatedItemName = req.body.itemName;
   const updatedQuantity = req.body.quantity;
   const updatedItemExp = req.body.itemExp;
   const updatedDesc = req.body.description;
   const updatedDate = Date(); //TODO: Add updated date added
   const errors = validationResult(req);
 
   if (!errors.isEmpty()) {
     return res.status(422).render('admin/edit-item', {
       pageTitle: 'MyPantry | Edit Pantry',
       path: '/item/edit-item',
       editing: true,
       hasError: true,
       product: {
         itemName: updatedItemName,
         itemExp: updatedItemExp,
         quantity: updatedQuantity,
         description: updatedDesc,
         dateAdded: updatedDate,
         _id: itemId,
       },
       errorMessage: errors.array()[0].msg,
       validationErrors: errors.array(),
     });
   }
   Item.findById(itemId).then(item => {
   // TODO: Validate if correct user is editing
     if ((item.userId.toString() !== req.user._id.toString()) && !req.user.isAdmin) {
       return res.redirect('/');
     }
      item.itemName = updatedItemName;
      item.quantity = updatedQuantity;
      item.description = updatedDesc;
      item.itemExp = updatedItemExp;
      item.dateAdded = updatedDate;
         return item.save().then(result => {
            console.log('UPDATED item!');
            res.redirect('/item/items');
         })
   })
   .catch(err => {
     const error = new Error(err);
     error.httpStatusCode = 500;
     return next(error);
   });
 };


exports.postDeleteItem = (req, res, next) => {
   const itemId = req.body.itemId;
   // TODO: 
   if (true) {
      Item.deleteOne({ _id: itemId, userId: req.user._id })
         .then(() => {
            console.log('DESTROYED ITEM');
            res.redirect('/item/items');
         })
         .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
         });
   }

};


exports.postSwitchLayout = (req, res, next) => {
   console.log(req.session.isListView)
   if(req.session.isListView == false ){
      req.session.isListView = true;
   } else {
      req.session.isListView = false;
   }
   return req.session.save(error => {
      res.redirect('/item/items');
      console.log(error)
   })
   
}


exports.postDeleteMode = (req, res, next) => {
   console.log(req.session.isListView)
   if(req.session.isDeleteMode == true ){
      req.session.isDeleteMode = false;
   } else {
      req.session.isDeleteMode = true;
   }
   return req.session.save(error => {
      res.redirect('/item/items');
      console.log(error)
   })
   
}

exports.postEditMode = (req, res, next) => {
   if(req.session.isEditMode == true ){
      req.session.isEditMode = false;
   } else {
      req.session.isEditMode = true;
   }
   return req.session.save(error => {
      res.redirect('/item/items');
      console.log(error)
   })

   
   
}