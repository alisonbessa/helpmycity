const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportsSchema = new Schema ({
    owner_ID : Schema.Types.ObjectId,
    location: {
        street: String,
        number: Number,
        city: String,
        lat: Number,
        long: Number,
    },
    category: {
        type: String,
        enum: [
            "Iluminação - Item 01",
            "Iluminação - Item 02",
            "Iluminação - Item 03",
            "Iluminação - Item 04",
            "Saneamento - Item 01",
            "Saneamento - Item 02",
            "Saneamento - Item 03",
            "Saneamento - Item 04",
        ]
    },
    picture: String,
    description: String,
    status: { type: Boolean, default: false },
},
{
    timestamps: true
},
);

reportsSchema.index({ location: '2dsphere' });
const Reports = mongoose.model('Reports', reportsSchema);
module.exports = Reports;








// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;


const placeSchema = new Schema(
    {
  name: String,
  type: { type: String, enum: ['coffee-shop', 'bookstore'] },
  location: { type: { type: String }, coordinates: [Number] },
},
  {
    timestamps: true
  }
);


// module.exports = Places;
