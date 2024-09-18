import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";


// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
// student 
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
// admin kitne job create kra hai abhi tk
export const getRecruiterJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateJob = async (req, res) => {
    try {
        const { title, description, requirements, salary,experienceLevel, location, jobType,  position } = req.body;
 
    
        const updateData = { title, description, requirements, salary, experienceLevel, location, jobType, position };

        const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        }
        return res.status(200).json({
            message:"Job information updated.",
            success:true
        })

    } catch (error) {
        console.log(error);
    }
}

export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Find and delete the job by ID
        const job = await Job.findByIdAndDelete(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job deleted successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred while deleting the job.",
            success: false
        });
    }
};

export const saveJobForLater = async (req, res) => {
    try {
        const userId = req.id; 
        const { jobId } = req.params; // Get the jobId from request parameters

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false,
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        // Add job to savedJobs if it's not already there
        if (!user.savedJobs.includes(jobId)) {
            user.savedJobs.push(jobId);
            await user.save();
        } else {
            return res.status(400).json({
                message: "Job is already saved.",
                success: false,
            });
        }

        // Return a success message
        return res.status(200).json({
            message: "Job saved for later successfully.",
            success: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};


export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id; // Get user ID from the request (assuming it's set via middleware or JWT)

        // Find the user and populate savedJobs with job details
        const user = await User.findById(userId).populate({
            path: 'savedJobs', // Populate the savedJobs field
            populate: {
                path: 'company', // Populate the company field within each job
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        // Return the user's saved jobs with populated company details
        return res.status(200).json({
            message: "Saved jobs retrieved successfully.",
            savedJobs: user.savedJobs,
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};


// Unsave Job
export const unsaveJob = async (req, res) => {
    try {
        const userId = req.id; // Assume user ID is obtained from JWT token
        const { jobId } = req.body;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        // Remove job from savedJobs
        user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        await user.save();

        return res.status(200).json({
            message: "Job removed from saved list.",
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};