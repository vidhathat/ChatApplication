module.exports = function(){
  return {
    SetRouting: function(router){
        router.get('/videochat', this.getstreamPage);
    },

    getstreamPage: function(req,res){
      res.render('videochat/stream');
    }
  }
}
