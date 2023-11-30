const { model, Schema } = require("mongoose");

const PetAdoptSchema = new Schema({
  category: {
    type: String,
  },
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  image: {
    type: String,
  },
  petId: {
    type: String,
  },
  user_name: {
    type: String,
  },
  user_email: {
    type: String,
  },
  user_number: {
    type: String,
  },
  user_address: {
    type: String,
  },
});

const PetAdoptDetails = model("PetAdoptDetails", PetAdoptSchema);

module.exports = PetAdoptDetails;
