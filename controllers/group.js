// const path =require('path');
// const fs = require('fs');

module.exports = function(Users, async, Message, FriendResult, Group,formidable,Image, aws){
    return {
        SetRouting: function(router){
            router.get('/group/:name', this.groupPage);
            router.post('/group/:name', this.groupPostPage);

            router.post('/uploadImage/:name' ,aws.Upload.any(), this.uploadImage);
            router.post('/uploadImage',this.imagePostPage);

            router.get('/logout', this.logout);
        },

        uploadImage: function(req,res) {
          const form = new formidable.IncomingForm();
          // form.uploadDir = path.join(__dirname, '../public/uploads');

          form.on('file',(field,file) => {
            // fs.rename(file.path, path.join(form.uploadDir, file.name),(err) => {
            //   if(err) throw err;
            //   console.log('File renamed successfully');
            // })
          });

          form.on('error', (err) => {
            console.log(err);
          });

          form.on('end', () => {
            console.log('File upload is successful');
          });

          form.parse(req);
        },

        imagePostPage: function(req,res){

          const newImage =new Image();
          newImage.sender = req.user._id;
          newImage.groupName = req.body.groupName;
          newImage.image = req.body.upload;
          newImage.createdAt = new Date();
          newImage.save((err) => {
            res.redirect('/group/'+req.body.groupName);
          });

        },

        groupPage: function(req, res){
            const name = req.params.name;

            async.parallel([
                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate('request.userId')

                        .exec((err, result) => {
                            callback(err, result);
                        })
                },

                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i")
                    Message.aggregate([
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                            "last_message_between":{
                                $cond:[
                                    {
                                        $gt:[
                                        {$substr:["$senderName",0,1]},
                                        {$substr:["$receiverName",0,1]}]
                                    },
                                    {$concat:["$senderName"," and ","$receiverName"]},
                                    {$concat:["$receiverName"," and ","$senderName"]}
                                ]
                            }
                            }, "body": {$first:"$$ROOT"}
                            }
                        }], function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                            ];

                            Message.populate(newResult, arr, (err, newResult1) => {
                                callback(err, newResult1);
                            });
                        }
                    )
                },

                function(callback){
                    Group.find({})
                         .populate('sender')
                         .exec((err, result) => {
                            callback(err, result)
                         });
                }
            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                const result3 = results[2];

                res.render('groupchat/group', {title: 'ChatApplication - Group', user:req.user, groupName:name, data: result1, chat:result2, groupMsg: result3});
            });
        },

        groupPostPage: function(req, res){
            FriendResult.PostRequest(req, res, '/group/'+req.params.name);

            async.parallel([
                function(callback){
                    if(req.body.message){
                        const group = new Group();
                        group.sender = req.user._id;
                        group.body = req.body.message;
                        group.name = req.body.groupName;
                        group.createdAt = new Date();

                        group.save((err, msg) => {
                            callback(err, msg);
                        });
                    }
                }
            ], (err, results) => {
                res.redirect('/group/'+req.params.name);
            });
        },

        logout: function(req, res){
            req.logout();
            req.session.destroy((err) => {
               res.redirect('/');
            });
        }
    }
}
