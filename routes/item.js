const path = require('path');

const express = require('express');

const itemController = require('../controllers/item');

const { check, body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-item', isAuth, itemController.getAddItem);

router.post('/add-item', isAuth, itemController.postAddItem);

router.get('/items', isAuth, itemController.getItems);

router.get('/edit-item/:itemId', isAuth, itemController.getEditItem)

router.post('/edit-item', isAuth,  itemController.postEditItem)

router.post('/delete-item', isAuth, itemController.postDeleteItem);

router.post('/change-theme', isAuth, itemController.postSwitchLayout);

router.post('/deleteMode', isAuth, itemController.postDeleteMode);

module.exports = router;