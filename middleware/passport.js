let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')
let util = require('util')

module.exports = (app) => {
  let passport = app.passport

  passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'username',
    failureFlash: true
  }, nodeifyit(async (username, password) => {
    let user
    if(username.indexOf('@')){
      let email = username.toLowerCase()
      user = await User.promise.findOne({email})
      await User.populate(user, 'posts.title', (err, result) => {
       if(err) console.log(err)
       console.log(result)
      })

      console.log('User after population: ' + user)
    } else {
      let regExp = new RegExp(username, '1')
      user = await User.promise.findOne({
        username: {$regex: regExp}
      })
    }
    let dbUserName
    if(user){
      dbUserName = user.username
      if(username.indexOf('@')){
        dbUserName = user.email
      }
    }

    if (!user || username !== dbUserName) {
      return [false, {message: 'Invalid username'}]
    }

    if (!await user.validatePassword(password)) {
      return [false, {message: 'Invalid password'}]
    }
    return user
  }, {spread: true})))

  passport.serializeUser(nodeifyit(async (user) => user._id))
  passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
  }))

  passport.use('local-signup', new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async (req, email, password) => {
      email = (email || '').toLowerCase()
      // Is the email taken?
      if (await User.promise.findOne({email})) {
        return [false, {message: 'That email is already taken.'}]
      }

      let {username, title, description} = req.body
      //let regExp = new RegExp(username, '1')
      //let query = {username: {$regex: regExp}}
      let query = {username}
      if(await User.promise.findOne(query)){
        return [false, {message: 'That username is already taken.'}]
      }

      // create the user
      let user = new User()
      user.email = email
      user.username = username
      user.blogTitle = title
      user.blogDescription = description
      // Use a password hash instead of plain-text
      user.password = password
      try{
        return await user.save()
      }catch(excep){
        console.log(util.inspect(excep))
        return [false, {message: excep.message}]
      }
  }, {spread: true})))
}
