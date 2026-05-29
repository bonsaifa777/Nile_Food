import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String },
  images: [{ type: String }],
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  sizes: [{
    name: { type: String },
    price: { type: Number }
  }],
  extras: [{
    name: { type: String },
    price: { type: Number },
    image: { type: String }
  }],
  ingredients: [{
    name: { type: String },
    amount: { type: String },
    image: { type: String }
  }],
  allergens: [{ type: String }],
  nutritionalInfo: {
    servingSize: { type: String },
    calories: { type: Number },
    totalFat: { type: String },
    saturatedFat: { type: String },
    transFat: { type: String },
    cholesterol: { type: String },
    sodium: { type: String },
    totalCarbohydrates: { type: String },
    dietaryFiber: { type: String },
    sugars: { type: String },
    protein: { type: String }
  },
  spiceLevel: { type: String, default: 'Medium' },
  preparationTime: { type: Number, default: 20 },
  calories: { type: Number },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

foodSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

foodSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Food', foodSchema);