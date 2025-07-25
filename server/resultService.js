import { Result } from './Models/result.model.js';
import { BatchResult } from './Models/classSemester.model.js';
import { results as fetchFromAPI } from './results.js';

export class ResultService {
    
    /**
     * Get results with caching logic
     * First check DB, if not found fetch from API and store in DB
     */
    static async getResults(formData) {
        const { year, semester, branch, section } = formData;
        
        try {
            // Step 1: Check if this batch exists in database
            const existingResults = await this.checkDatabaseForResults(formData);
            
            if (existingResults && existingResults.length > 0) {
                console.log(`Found ${existingResults.length} results in database for ${year}-${branch}-${semester}-${section}`);
                return this.formatResultsForResponse(existingResults);
            }
            
            // Step 2: Check if we're already fetching this batch
            const batchStatus = await this.getBatchStatus(formData);
            if (batchStatus && batchStatus.fetchStatus === 'in-progress') {
                return { message: 'Results are being fetched, please try again in a moment' };
            }
            
            // Step 3: Fetch from API and store in database
            console.log(`Fetching results from API for ${year}-${branch}-${semester}-${section}`);
            const apiResults = await this.fetchAndStoreResults(formData);
            
            return apiResults;
            
        } catch (error) {
            console.error('Error in getResults:', error);
            throw new Error('Failed to get results');
        }
    }
    
    /**
     * Check database for existing results
     */
    static async checkDatabaseForResults(formData) {
        const { year, semester, branch, section } = formData;
        
        const results = await Result.find({
            year: year,
            semester: semester,
            branch: branch,
            section: section,
            isActive: true
        }).sort({ rollNo: 1 });
        
        return results;
    }
    
    /**
     * Get batch fetch status
     */
    static async getBatchStatus(formData) {
        const { year, semester, branch, section } = formData;
        
        const batchResult = await BatchResult.findOne({
            year: year,
            semester: semester,
            branch: branch,
            section: section
        });
        
        return batchResult;
    }
    
    /**
     * Fetch from API and store in database
     */
    static async fetchAndStoreResults(formData) {
        const { year, semester, branch, section } = formData;
        
        try {
            // Mark batch as in-progress
            await BatchResult.findOneAndUpdate(
                { year, semester, branch, section },
                { 
                    fetchStatus: 'in-progress',
                    lastFetchedAt: new Date()
                },
                { upsert: true, new: true }
            );
            
            // Fetch from API
            const apiResultsString = await fetchFromAPI(formData);
            const apiResults = typeof apiResultsString === 'string' ? 
                JSON.parse(apiResultsString) : apiResultsString;
            
            if (!apiResults || apiResults.length === 0) {
                // Mark as completed but no results
                await BatchResult.findOneAndUpdate(
                    { year, semester, branch, section },
                    { 
                        fetchStatus: 'completed',
                        isComplete: true,
                        totalResults: 0
                    }
                );
                return [];
            }
            
            // Store results in database
            const savedResults = await this.saveResultsToDatabase(apiResults, formData);
            
            // Update batch status
            await BatchResult.findOneAndUpdate(
                { year, semester, branch, section },
                { 
                    fetchStatus: 'completed',
                    isComplete: true,
                    totalResults: savedResults.length
                }
            );
            
            console.log(`Saved ${savedResults.length} results to database`);
            return this.formatResultsForResponse(savedResults);
            
        } catch (error) {
            // Mark batch as failed
            await BatchResult.findOneAndUpdate(
                { year, semester, branch, section },
                { fetchStatus: 'failed' }
            );
            
            console.error('Error fetching and storing results:', error);
            throw error;
        }
    }
    
    /**
     * Save API results to database
     */
    static async saveResultsToDatabase(apiResults, formData) {
        const { year, semester, branch, section } = formData;
        const savedResults = [];
        
        for (const result of apiResults) {
            try {
                const resultDoc = new Result({
                    name: result.name,
                    rollNo: result.rollNo,
                    sgpa: result.sgpa,
                    year: year,
                    semester: semester,
                    branch: branch,
                    section: section
                });
                
                const saved = await resultDoc.save();
                savedResults.push(saved);
                
            } catch (error) {
                // Handle duplicate entries or other errors
                if (error.code === 11000) {
                    console.log(`Duplicate entry for ${result.rollNo}, skipping...`);
                } else {
                    console.error(`Error saving result for ${result.rollNo}:`, error.message);
                }
            }
        }
        
        return savedResults;
    }
    
    /**
     * Format results for consistent response
     */
    static formatResultsForResponse(results) {
        return results.map(result => ({
            name: result.name,
            rollNo: result.rollNo,
            sgpa: result.sgpa
        }));
    }
    
    /**
     * Clear cache for a specific batch (utility function)
     */
    static async clearBatchCache(formData) {
        const { year, semester, branch, section } = formData;
        
        await Result.deleteMany({
            year: year,
            semester: semester,
            branch: branch,
            section: section
        });
        
        await BatchResult.deleteOne({
            year: year,
            semester: semester,
            branch: branch,
            section: section
        });
        
        console.log(`Cleared cache for ${year}-${branch}-${semester}-${section}`);
    }
}
