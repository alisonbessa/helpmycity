const mongoose    = require("mongoose");
const Schema      = mongoose.Schema;

const reportsSchema = new Schema(
  {
    owner_ID: Schema.Types.ObjectId,
    location: {name:String, type: { type: String }, coordinates: [Number] },
    address: {
      street: String,
      number: String,
      city: String,
      userlat: Number,
      userlong: Number,
      latOfStreet: Number,
      longOfStreet: Number,
      latOfPhoto: Number,
      longOfPhoto: Number,
    },
    category: {
      type: String,
      enum: [
        "Rede de Água",
        "Rede de Esgoto",
        "Rede Elétrica",
        "Iluminação da via",
        "Calçadas",
        "Via pública",
        "Pessoas",
        "Outros",
      ],
    },
    picture: String,
    description: String,
    status: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

reportsSchema.index({ location: "2dsphere" });
const Reports = mongoose.model("Reports", reportsSchema);
module.exports = Reports;
