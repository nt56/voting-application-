const express = require("express");
const router = express.Router();
const Candidate = require("./../models/candidate");
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

//check the user is admin or not
const isAdmin = async (userID) => {
  try {
    const user = User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return err;
  }
};

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    //if not admin then return
    if (!isAdmin(req.user.id)) {
      return res.status(403).json({ message: "user does not have admin role" });
    }

    //if admin then continue and add candidate
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("candidate data saved");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//update candidate data
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    //if not admin then return
    if (!isAdmin(req.user.id)) {
      return res.status(403).json({ message: "user does not have admin role" });
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

    console.log("candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//delete candidate data
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    //if not admin then return
    if (!isAdmin(req.user.id)) {
      return res.status(403).json({ message: "user does not have admin role" });
    }

    //if admin then continue and update candidate
    const candidateID = req.params.candidateID; // Extract the id from the URL parameter
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("candidate deleted");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//voting
// no admin can vote
// user can only vote once
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  candidateID = req.params.candidateID;
  userId = req.user.id;

  try {
    // Find the Candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Find the User document with the specified userID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.role == "admin") {
      return res.status(403).json({ message: "admin is not allowed" });
    }
    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Update the Candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // update the user document
    user.isVoted = true;
    await user.save();
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
