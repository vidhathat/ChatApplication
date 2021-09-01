const mongoose =require('mongoose');

const imageFiles = mongoose.Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  groupName: {type: String,default:''},
  image: {type: String, default: 'default.png'},
  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Image',imageFiles)
