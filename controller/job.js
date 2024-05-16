const Job = require("../models/job");

const createJobPost = async (req, res, next) => {
  try {
    const currentUserId = req.currentUserId;
    const {
      companyName,
      logoUrl,
      title,
      description,
      salary,
      location,
      duration,
      locationType,
      skills,
      jobType,
      information,
      refUserId,
    } = req.body;

    if (
      !companyName ||
      !logoUrl ||
      !title ||
      !description ||
      !salary ||
      !location ||
      !duration ||
      !locationType ||
      !skills ||
      !jobType ||
      !information
    ) {
      return res.status(400).json({ errorMessage: "Bad request" });
    }
    const jobDetails = new Job({
      companyName,
      logoUrl,
      title,
      description,
      salary,
      location,
      duration,
      locationType,
      skills,
      jobType,
      information,
      refUserId: currentUserId,
    });
    await jobDetails.save();
    res.json({ message: "Job created successfully" });
  } catch (error) {
    next(error);
  }
};

const getJobDetailsById = async (req, res, next) => {
  try {
    const { jobId, userId } = req.params;

    if (!jobId) {
      return res.status(400).json({ errorMessage: "Bad request" });
    }

    const jobDetails = await Job.findById(jobId);

    if (!jobDetails) {
      return res.status(400).json({
        errorMessage: "Bad request",
      });
    }
    let isEditable = false;
    // console.log(userId);
    // console.log(
    //   jobDetails.refUserId,
    //   userId,
    //   jobDetails.refUserId.toString() === userId
    // );

    if (jobDetails.refUserId.toString() === userId) {
      isEditable = true;
    }

    res.json({ jobDetails, isEditable: isEditable });
  } catch (error) {
    next(error);
  }
};

const updateJobDetailsById = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const {
      companyName,
      logoUrl,
      title,
      description,
      salary,
      location,
      duration,
      locationType,
      skills,
      jobType,
      information,
      refUserId,
    } = req.body;

    if (
      !companyName ||
      !logoUrl ||
      !title ||
      !description ||
      !salary ||
      !location ||
      !duration ||
      !locationType ||
      !skills ||
      !jobType ||
      !information
    ) {
      res.status(400).json({ errorMessage: "Bad request" });
    }
    if (!jobId) {
      return res.status(400).json({ errorMessage: "Bad request" });
    }
    const isJobExist = await Job.findOne({ _id: jobId });

    //check if refUserId is == paramter id

    if (!isJobExist) {
      return res.status(400).json({ errorMessage: "Bad request" });
    }
    await Job.updateOne(
      { _id: jobId },
      {
        $set: {
          companyName,
          logoUrl,
          title,
          description,
          salary,
          location,
          duration,
          locationType,
          skills,
          jobType,
          information,
        },
      }
    );
    res.json({ message: "Job updated  successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const searchQuery = req.query.searchQuery || "";
    const activeUserId = req.params.userId || "";
    const skills = req.query.skills;
    let filteredSkills;
    let filter = {};

    if (skills && skills.length > 0) {
      filteredSkills = skills.split(",");
      const caseSensitiveFilteredSkills = filteredSkills.map(
        (element) => new RegExp(element, "i")
      );
      filteredSkills = caseSensitiveFilteredSkills;
      filter = { skills: { $in: filteredSkills } };
    }

    const jobList = await Job.find(
      {
        title: { $regex: searchQuery, $options: "i" },
        ...filter,
      }
      // ,{
      //   companyName: 1,
      //   title: 1,
      //   description: 1,
      //   skills: 1,
      //   salary: 1,
      //   location: 1,
      //   jobType: 1,
      // }
    );

    // const updatedJobList = jobList.map((data) => {
    //   if (!data.refUserId.toString === activeUserId)
    //     return { ...data, isEditable: true };
    // });

    res.json({ data: jobList });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJobPost,
  getJobDetailsById,
  updateJobDetailsById,
  getAllJobs,
};
