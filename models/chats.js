const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const msgSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Room1 = mongoose.model("Room1", msgSchema);
const Room2 = mongoose.model("Room2", msgSchema);
const Room3 = mongoose.model("Room3", msgSchema);
const Room4 = mongoose.model("Room4", msgSchema);

module.exports = {
  Room1,
  Room2,
  Room3,
  Room4,
};
