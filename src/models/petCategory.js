const { model, Schema } = require("mongoose");

const PetCategorySchema = new Schema({
  category_name: String,
  image_fill: String,
  image_draw: String,
});

const PetCategory = model("PetCategory", PetCategorySchema);

module.exports = PetCategory;
