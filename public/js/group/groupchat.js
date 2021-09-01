$(document).ready(function(){
    var socket = io();

    var room = $('#groupName').val();
    var sender = $('#sender').val();

    var userPic = $('#name-image').val();

    socket.on('connect', function(){

        var params = {
            room: room,
            name: sender
        }
        socket.emit('join', params, function(){
            //console.log('User has joined this channel');
        });
    });

    socket.on('usersList', function(users){
        var ol = $('<ol></ol>');

        console.log(users);

        for(var i = 0; i < users.length; i++){
            ol.append('<p><a id="val" data-toggle="modal" data-target="#myModal">'+users[i]+'</a></p>');
        }

        $(document).on('click', '#val', function(){
            $('#name').text('@'+$(this).text());
            $('#receiverName').val($(this).text());
            $('#nameLink').attr("href", "/profile/"+$(this).text());
        });

        $('#numValue').text('('+users.length+')');
        $('#users').html(ol);
    });

    socket.on('newMessage', function(data){
        var template = $('#message-template').html();
        var message = Mustache.render(template, {
            text: data.text,
            sender: data.from,
            userImage: data.image
        });

        $('#messages').append(message);
    });

    socket.on('image-uploaded', function (message) {
            // var img = document.createElement('img');
            // img.setAttribute('src', message.name);
            // img.setAttribute('height', '100px');
            // document.body.appendChild(img);

            var elem = document.createElement("img");
            elem.setAttribute('src', 'https://chatapplication-websockets.s3.ap-south-1.amazonaws.com/'+message.image);
            elem.setAttribute('height', '100px');
            // elem.setAttribute("width", "1024");
            elem.setAttribute("alt", "image");

            var template = $('#message-template').html();
            var message = Mustache.render(template, {
                text: elem.value,
                sender: message.from,
                userImage: message.image
            });

            $('#messages').append(message);

            // document.getElementById("messages").innerHTML += '<p><strong>' + message.from + ' :</p>';
            // document.getElementById("messages").appendChild(elem)
        });



    $('#message-form').on('submit', function(e){
        e.preventDefault();

        var msg = $('#msg').val();


        socket.emit('createMessage', {
            text: msg,
            room: room,
            sender: sender,
            userPic: userPic
        }, function(){
            $('#msg').val('');
        });


        $.ajax({
            url: '/group/'+room,
            type: 'POST',
            data: {
                message: msg,
                groupName: room
            },
            success: function(){
                $('#msg').val('');
            }
        })

    });

    $('.upload-btn').on('click', function(){
        $('#upload-input').click();
    });

    $('#upload-input').on('change', function(e){
        e.preventDefault();

        var uploadInput = $('#upload-input');

        if(uploadInput.val() != ''){
            var formData = new FormData();

            formData.append('upload', uploadInput[0].files[0]);
            console.log(formData);

            $.ajax({
                url: '/uploadImage/'+room,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(){
                    uploadInput.val('');
                }
            })
        }
    })

    // $('#image-form').on('submit', function(e){
    //     e.preventDefault();
    //
    //     var image = $('#upload-input').val();
    //
    //
    //     socket.emit('createMessage', {
    //         room: room,
    //         sender: sender,
    //         userPic: userPic,
    //         image: image
    //     }, function(){
    //         $('#upload-input').val('');
    //     });
    //
    // });



    // var file = document.getElementById('upload-input');
    //
    // file.addEventListener('change', function () {
    //         if (!file.files.length) {
    //             return;
    //         }
    //
    //         var firstFile = file.files[0],
    //             reader = new FileReader();
    //
    //         reader.onloadend = function () {
    //             socket.emit('upload-image', {
    //                 name: firstFile.name,
    //                 data: reader.result,
    //                 room: room,
    //                 sender: sender,
    //                 userPic: userPic
    //
    //             });
    //         };
    //
    //         reader.readAsArrayBuffer(firstFile);
    // });

});
