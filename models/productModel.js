import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Quantity: {
        type: Number,
        required: true
    },
    Rate: {
        type: Number,
        required: true
    },
    Rate: {
        type: Number,
        required: true
    },
    Gst: {
        type: Number,
        required: true
    },
    Buyer: {
        type: mongoose.ObjectId,
        ref: "Users",
        required: true
    }

})

export default mongoose.model("Products", productSchema);