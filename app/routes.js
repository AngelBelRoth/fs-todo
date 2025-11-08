const { filter } = require("lodash");
const { findOneAndUpdate } = require("./models/user");

module.exports = function (app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('welcome.ejs');
  });

  // TO-DO SECTION =========================
  app.get('/todolist', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('todo.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/messages', (req, res) => {
    db.collection('messages').save({ task: req.body.task }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/todolist')
    })
  })

  // RyRy
  // findOneAndUpdate(filter, update, options)
  // e.g. filter = {determineWhatToUpdate: valueIWantToUpdate}
  // e.g. update = {$set:{fieldIWantToUpdate:value}}

  app.put('/:id', async (req, res) => {
    const { todo } = req.body;
    try {
      const task = await db.collection('messages').findOneAndUpdate({ task: req.body.task }, 
        { $set: {
          task: req.body.task
        }},{
          sort: { _id: -1 },
          upsert: true
        })
      const updateTask = await task.save();
      res.json(updateTask);
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Server error" });
    }
  })

  // app.put('/:id', (req, res) => {
  //   db.collection('messages').findOneAndUpdate({ task: req.body.task }, {
  //     $set: {
  //       task: req.body.task
  //     }
  //   }, { upsert: true }, (err, result) => {
  //     if (err) return console.log(err)
  //     console.log('saved to database')
  //     console.log(result)
  //     res.redirect('/')
  //   })
  // })


  app.delete('/messages', (req, res) => {
    db.collection('messages').findOneAndDelete({ task: req.body.task }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/todolist', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/todolist', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/todolist');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
