import { Result } from './Models/result.model.js';
import { BatchResult } from './Models/classSemester.model.js';
import { HtmlResult } from './Models/htmlResult.model.js';
import { results as fetchFromAPI } from './results.js';
import cheerio from 'cheerio';
import axios from 'axios';

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

    /**
     * Get detailed result for a specific student (returns raw HTML)
     */
    static async getStudentDetailedResult(rollNo) {
        try {
            // First check if we have the HTML stored in database
            let htmlData = await HtmlResult.findOne({ rollNo: rollNo, isActive: true });
            
            if (htmlData) {
                console.log(`Found cached HTML for ${rollNo}`);
                // Update last accessed time
                htmlData.lastAccessed = new Date();
                await htmlData.save();
                
                return {
                    htmlContent: htmlData.htmlContent,
                    source: 'cache',
                    cachedAt: htmlData.fetchedAt,
                    rollNo: rollNo
                };
            }
            
            // If not in cache, fetch from API
            console.log(`Fetching fresh HTML for ${rollNo} from API`);
            const response = await axios.get(`http://results.ietdavv.edu.in/DisplayStudentResult?rollno=${rollNo}&typeOfStudent=Regular`);
            const html = response.data;
            
            if (!html || html.trim() === '') {
                throw new Error('No data received from API');
            }
            
            // Store the HTML in database for future use
            await this.storeHtmlResult(rollNo, html);
            
            return {
                htmlContent: html,
                source: 'api',
                fetchedAt: new Date().toISOString(),
                rollNo: rollNo
            };
            
        } catch (error) {
            console.error(`Error fetching detailed result for ${rollNo}:`, error);
            throw new Error(`Failed to fetch detailed result for ${rollNo}: ${error.message}`);
        }
    }

    /**
     * Store HTML result in database
     */
    static async storeHtmlResult(rollNo, htmlContent) {
        try {
            // Extract basic info for quick reference
            const parsedData = this.extractBasicInfo(htmlContent);
            
            const htmlResult = new HtmlResult({
                rollNo: rollNo,
                htmlContent: htmlContent,
                parsedData: parsedData
            });
            
            await htmlResult.save();
            console.log(`Stored HTML for ${rollNo} in database`);
            
        } catch (error) {
            // If it's a duplicate key error, update the existing record
            if (error.code === 11000) {
                await HtmlResult.findOneAndUpdate(
                    { rollNo: rollNo },
                    { 
                        htmlContent: htmlContent,
                        parsedData: this.extractBasicInfo(htmlContent),
                        fetchedAt: new Date(),
                        isActive: true
                    }
                );
                console.log(`Updated HTML for ${rollNo} in database`);
            } else {
                console.error(`Error storing HTML for ${rollNo}:`, error.message);
            }
        }
    }

    /**
     * Extract basic info for storage (lighter version)
     */
    static extractBasicInfo(html) {
        const $ = cheerio.load(html);
        
        return {
            name: $('td:contains("Student Name")').next().text().trim(),
            fatherName: $('td:contains("Father Name")').next().text().trim(),
            branch: $('td:contains("Branch")').next().text().trim(),
            semester: $('td:contains("Semester")').next().text().trim(),
            sgpa: $('td:contains("SGPA")').next().text().trim(),
            cgpa: $('td:contains("CGPA")').next().text().trim(),
            result: $('td:contains("Result")').next().text().trim()
        };
    }

    /**
     * Extract detailed data from HTML response
     */
    static extractDetailedData(html) {
        const $ = cheerio.load(html);
        
        // Extract basic info
        const name = $('td:contains("Student Name")').next().text().trim();
        const rollNo = $('td:contains("Roll Number")').next().text().trim();
        const fatherName = $('td:contains("Father Name")').next().text().trim();
        const branch = $('td:contains("Branch")').next().text().trim();
        const semester = $('td:contains("Semester")').next().text().trim();
        const sgpa = $('td:contains("SGPA")').next().text().trim();
        const cgpa = $('td:contains("CGPA")').next().text().trim();
        const result = $('td:contains("Result")').next().text().trim();
        
        // Extract subject-wise marks
        const subjects = [];
        $('table').each((index, table) => {
            $(table).find('tr').each((rowIndex, row) => {
                const cells = $(row).find('td');
                if (cells.length >= 5) {
                    const subjectCode = $(cells[0]).text().trim();
                    const subjectName = $(cells[1]).text().trim();
                    const internalMarks = $(cells[2]).text().trim();
                    const externalMarks = $(cells[3]).text().trim();
                    const totalMarks = $(cells[4]).text().trim();
                    const grade = $(cells[5]) ? $(cells[5]).text().trim() : '';
                    
                    if (subjectCode && subjectName && !subjectCode.includes('Subject')) {
                        subjects.push({
                            subjectCode,
                            subjectName,
                            internalMarks,
                            externalMarks,
                            totalMarks,
                            grade
                        });
                    }
                }
            });
        });
        
        return {
            basicInfo: {
                name,
                rollNo,
                fatherName,
                branch,
                semester,
                sgpa,
                cgpa,
                result
            },
            subjects,
            fetchedAt: new Date().toISOString()
        };
    }

    /**
     * Get raw HTML for a specific student (utility method)
     */
    static async getStoredHtml(rollNo) {
        try {
            const htmlData = await HtmlResult.findOne({ rollNo: rollNo, isActive: true });
            if (htmlData) {
                // Update last accessed time
                htmlData.lastAccessed = new Date();
                await htmlData.save();
                return {
                    rollNo: htmlData.rollNo,
                    htmlContent: htmlData.htmlContent,
                    fetchedAt: htmlData.fetchedAt,
                    lastAccessed: htmlData.lastAccessed,
                    contentSize: htmlData.contentSize
                };
            }
            return null;
        } catch (error) {
            console.error(`Error getting stored HTML for ${rollNo}:`, error);
            return null;
        }
    }

    /**
     * Get HTML storage statistics
     */
    static async getHtmlStats() {
        try {
            const totalCount = await HtmlResult.countDocuments({ isActive: true });
            const totalSize = await HtmlResult.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: null, totalSize: { $sum: "$contentSize" } } }
            ]);
            
            const recentCount = await HtmlResult.countDocuments({
                isActive: true,
                fetchedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            return {
                totalFiles: totalCount,
                totalSizeBytes: totalSize[0]?.totalSize || 0,
                totalSizeMB: ((totalSize[0]?.totalSize || 0) / (1024 * 1024)).toFixed(2),
                recentFiles24h: recentCount
            };
        } catch (error) {
            console.error('Error getting HTML stats:', error);
            return null;
        }
    }

    /**
     * Clean old HTML files (utility for maintenance)
     */
    static async cleanOldHtmlFiles(daysOld = 30) {
        try {
            const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
            
            const result = await HtmlResult.deleteMany({
                fetchedAt: { $lt: cutoffDate },
                lastAccessed: { $lt: cutoffDate }
            });
            
            console.log(`Cleaned ${result.deletedCount} old HTML files`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning old HTML files:', error);
            return 0;
        }
    }
}
