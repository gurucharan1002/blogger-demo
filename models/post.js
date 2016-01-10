let mongoose = require('mongoose')
let nodeify = require('bluebird-nodeify')
require('songbird')

let PostSchema = mongoose.Schema({
  userid: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    body: String,
    created: Date,
    creator: String
  }]
})

// PostSchema.pre('remove', function(callback){
//   nodeify(async () => {
//     console.log('Pre-remove'+ mongoose.model('User'))
//     console.log('ID: ' + this._id)
//     await mongoose.model('User').update(
//       {_id: {$in: this.creator}},
//       {$pull: {posts: this._id}},
//       {multi: true}
//     ).exec()
//   }(), callback)
// })

module.exports = mongoose.model('Post', PostSchema)
