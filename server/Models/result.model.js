import mongoose from 'mongoose';

// Result schema for storing student results with caching capability
const resultSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    rollNo: {
        type: String,
        required: true,
        trim: true
    },
    sgpa: {
        type: String,
        required: true,
        trim: true
    },
    // Additional fields for organizing results
    year: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        required: true,
        trim: true
    },
    // Metadata for caching
    fetchedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for unique student per batch-semester-branch-section
resultSchema.index({ 
    rollNo: 1,
    year: 1,
    semester: 1,
    branch: 1,
    section: 1
}, { unique: true });

// Index for efficient querying by batch criteria
resultSchema.index({ 
    year: 1,
    semester: 1,
    branch: 1,
    section: 1
});

export const Result = mongoose.model("Result", resultSchema);