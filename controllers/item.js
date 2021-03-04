const Item = require('../models/item');

const { validationResult } = require('express-validator');

exports.getAddItem = (req, res, next) => {
   res.render('item/edit-item', {
      pageTitle: 'Add Item',
      path: '/item/add-item',
      editing: false,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
   })
};

exports.getItems = (req, res, next) => {
   // TODO: get item by user
   Item.find().then(items => {
      return res.render('item/items', {
         pageTitle: 'Items',
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
   const quantitiy = req.body.quantitiy;
   const description = req.body.description;
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).render('item/edit-item', {
         pageTitle: 'Add item',
         path: '/item/edit-item',
         editing: false,
         hasError: true,
         item: {
            itemName: itemName,
            itemExp: itemExp,
            quantitiy: quantitiy,
            description: description,
         },
         errorMessage: errors.array()[0].msg,
         validationErrors: errors.array(),
      });
   }
   const item = new Item({
      itemName: itemName,
      itemExp: itemExp,
      quantitiy: quantitiy,
      description: description,
      dateAdded: dateAdded
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

exports.getEditItem = (res, req, next) => {
   console.log(req)
   const editMode = req.query.edit;
   if(!editMode) {
      return res.redirect('/');
   }
   const itemId = req.params.itemId
   Item.findById(itemId).then(item => {
      if (!item) {
         return res.redirect('/');
      }
      res.render('item/edit-item'), {
         pageTitle: 'Edit item',
         path: '/item/edit-item',
         editing: editMode,
         item: item,
         hasError: false,
         errorMessage: null,
         validationErrors: [],
      }
   }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
   })
};

exports.postEditItem = (req, res, next) => {
   const itemId = req.body.itemId;
   const updatedItemName = req.body.itemName;
   const updatedQuantity = req.body.quantitiy;
   const updatedItemExp = req.body.itemExp;
   const updatedDesc = req.body.description;
   // const updatedDat = req.body.description; //TODO: Add updated date added
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(422).render('item/edit-item', {
         pageTitle: 'Edit Item',
         path: '/item/edit-item',
         editing: true,
         hasError: true,
         item: {
            itemName: updatedItemName,
            itemExp: updatedItemExp,
            quantitiy: updatedQuantity,
            description: updatedDesc,
            _id: itemId,
         },
         errorMessage: errors.array()[0].msg,
         validationErrors: errors.array(),
      });
   }
   Item.findById(itemId).then(item => {
      //TODO: Validate if correct user is editing

      // if ((item.userId.toString() !== req.user._id.toString()) && !req.user.isAdmin) {
      //   return res.redirect('/');
      // }
      item.itemName = updatedItemName;
      item.quantitiy = updatedQuantity;
      item.description = updatedDesc;
      item.itemExp = updatedItemExp;
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
   // TODO: Check if correct user is deleting product
   if (true) {
      Item.deleteOne({ _id: itemId })
         .then(() => {
            console.log('DESTROYED PRODUCT');
            res.redirect('/item/items');
         })
         .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
         });
   }

};
