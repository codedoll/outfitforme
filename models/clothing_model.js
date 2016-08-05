var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var clothingSchema = new Schema({
        'name': String, 
        'tempmin': Number , 
        'tempmax': Number,
        'keywords': String, 
        'imgurl': String
});


var Clothing = mongoose.model('Clothing', clothingSchema);

module.exports  = Clothing;