import mongoose from 'mongoose'

const Pdf = new mongoose.Schema({
    name: { type: String, required: true },
    
})

const PdfSchema = mongoose.model('Pdf', Pdf)

export default PdfSchema