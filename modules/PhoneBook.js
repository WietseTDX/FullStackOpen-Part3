const mongoose = require('mongoose')

const { phoneNumberValidator } = require('./PhoneBookValidator')

mongoose.set('strictQuery', false);

console.log('connecting to MONGO')
mongoose.connect(process.env.MONGO_URI)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    });


const PhoneSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: phoneNumberValidator,
            message: number => `${number.value} is not a valid phone number`
        },
        required: true
    }
});


PhoneSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});


module.exports = mongoose.model('Phonebook', PhoneSchema);