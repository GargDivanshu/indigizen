import mongoose from 'mongoose'

const Offset = new mongoose.Schema({
    data: [{ x: { type: Number }, y: { type: Number } }],
})


const offsetSchema = mongoose.model('Offset', Offset)

export default offsetSchema
