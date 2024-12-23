const express = require("express");
const router = express.Router();
const Candidate = require("./../models/candidate");
const User = require("./../models/user");
const { isAdmin } = require("../utils/validate");
const { userAuth } = require("../middlewares/auth");

// POST route to add a candidate
router.post("/newCandidate", userAuth, async (req, res) => {
  try {
    //if not admin then return
    const { _id } = req.user;
    if (!isAdmin(_id)) {
      return res
        .status(403)
        .json({ message: "only admin can add the candidates" });
    }

    //if admin then continue and add candidate
    const data = req.body;
    const newCandidate = new Candidate(data);
    await newCandidate.save();
    res.status(200).send("candidate data saved");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//update candidate data
router.patch("/updateCandidate/:candidateID", userAuth, async (req, res) => {
  try {
    //if not admin then return
    if (!isAdmin(req.user.id)) {
      return res
        .status(403)
        .json({ message: "only admin can update the candidates" });
    }

    //if admin then continue and update candidate
    const candidateID = req.params.candidateID; // Extract the id from the URL parameter
    const updateCandidateData = req.body; // Updated data for the person
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updateCandidateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run Mongoose validation
      }
    );

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).send("candidate data updated");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//delete candidate data
router.delete("/deleteCandidate/:candidateID", userAuth, async (req, res) => {
  try {
    //if not admin then return
    if (!isAdmin(req.user.id)) {
      return res
        .status(403)
        .json({ message: "only admin can delete the candidates" });
    }

    //if admin then continue and update candidate
    const candidateID = req.params.candidateID; // Extract the id from the URL parameter
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).send("candidate deleted");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//voting
router.post("/vote/:candidateID", userAuth, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user._id;

  try {
    // Find the Candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Find the User document with the specified userID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("user not found");
    }
    if (user.role == "admin") {
      return res.status(403).send("admin is not allowed");
    }
    if (user.isVoted) {
      return res.status(400).send("You have already voted");
    }

    // Update the Candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).send("Vote is successfull...!");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// vote count
router.get("/vote/count", async (req, res) => {
  try {
    // Find all candidates and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({ voteCount: "descending" });

    // Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get List of all candidates with only name and party fields
router.get("/", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id");

    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
