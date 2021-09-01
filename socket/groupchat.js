module.exports = function(io, Users,fs,path){

    const users = new Users();

    io.on('connection', (socket) => {

        socket.on('join', (params, callback) => {
            socket.join(params.room);

            users.AddUserData(socket.id, params.name, params.room);

            io.to(params.room).emit('usersList', users.GetUsersList(params.room));

            callback();
        });

        socket.on('createMessage', (message, callback) => {
            io.to(message.room).emit('newMessage', {
                text: message.text,
                room: message.room,
                from: message.sender,
                image: message.userPic
            });

            callback();
        });

        socket.on('upload-image', function (message) {

            var writer = fs.createWriteStream(path.resolve(__dirname, './public/tmp/' + message.name), {
                encoding: 'base64'
            });

            console.log('Uploading image...');

            writer.write(message.data);
            writer.end();

            writer.on('finish', function () {
                console.log('Image uploaded!');

                io.to(message.room).emit('image-uploaded', {
                    name: '/tmp/' + message.name,
                    room: message.room,
                    from: message.sender,
                    image: message.userPic
                });

            });
        });

        socket.on('disconnect', () => {
            var user = users.RemoveUser(socket.id);

            if(user){
                io.to(user.room).emit('usersList', users.GetUsersList(user.room));
            }
        })
    });
}
