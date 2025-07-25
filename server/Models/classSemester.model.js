import mongoose from 'mongoose';

// Schema for tracking batch result fetches
const batchResultSchema = new mongoose.Schema({
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
    totalResults: {
        type: Number,
        default: 0
    },
    lastFetchedAt: {
        type: Date,
        default: Date.now
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    fetchStatus: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index for unique batch combination
batchResultSchema.index({ 
    year: 1,
    semester: 1,
    branch: 1,
    section: 1
}, { unique: true });

export const BatchResult = mongoose.model("BatchResult", batchResultSchema);
