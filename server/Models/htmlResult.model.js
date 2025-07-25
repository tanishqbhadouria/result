import mongoose from 'mongoose';

// Schema for storing raw HTML result files
const htmlResultSchema = new mongoose.Schema({
    rollNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    htmlContent: {
        type: String,
        required: true
    },
    contentSize: {
        type: Number,
        required: true
    },
    fetchedAt: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Optional parsed data for quick access
    parsedData: {
        name: String,
        fatherName: String,
        branch: String,
        semester: String,
        sgpa: String,
        cgpa: String,
        result: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
htmlResultSchema.index({ rollNo: 1 });
htmlResultSchema.index({ fetchedAt: -1 });

// Pre-save middleware to calculate content size
htmlResultSchema.pre('save', function(next) {
    this.contentSize = Buffer.byteLength(this.htmlContent, 'utf8');
    this.lastAccessed = new Date();
    next();
});

export const HtmlResult = mongoose.model("HtmlResult", htmlResultSchema);
