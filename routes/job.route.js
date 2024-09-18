import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {  deleteJob, getAllJobs, getJobById, getRecruiterJobs, getSavedJobs, postJob, saveJobForLater, unsaveJob, updateJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getrecruiterjobs").get(isAuthenticated, getRecruiterJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put(isAuthenticated, updateJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJob);

// Route to save a job for later
router.get('/saved-jobs', isAuthenticated, getSavedJobs);
router.post("/save-job/:jobId", isAuthenticated, saveJobForLater);


// Route to unsave a job
router.post("/unsave-job", isAuthenticated, unsaveJob);

export default router;

