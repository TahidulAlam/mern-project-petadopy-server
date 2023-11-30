const { model, Schema } = require("mongoose");

const PetListSchema = new Schema({
  category: String,
  name: String,
  image: String,
  age: Number,
  location: String,
  description: String,
  adopted: Boolean,
  dateField: { type: Date },
});

const PetList = model("PetList", PetListSchema);

module.exports = PetList;
