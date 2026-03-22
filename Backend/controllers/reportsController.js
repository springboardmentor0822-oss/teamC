const Petition = require("../models/Petition");
const Poll = require("../models/Poll");

exports.getGlobalReports = async (req, res) => {
  try {

    const { days, location } = req.query;

    let match = {};

    /* ================= DATE FILTER ================= */

    if (days) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Number(days));

      match.createdAt = { $gte: pastDate };
    }

    /* ================= LOCATION FILTER ================= */

    if (location) {
      match.location = location;
    }

    /* ================= PETITION STATS ================= */

    const petitionStats = await Petition.aggregate([
      { $match: match },

      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          signatures: { $sum: { $size: "$signatures" } }
        }
      }
    ]);

    let petitions = {
      total: 0,
      active: 0,
      underReview: 0,
      closed: 0
    };

    let totalSignatures = 0;

    petitionStats.forEach(stat => {
      petitions.total += stat.count;
      totalSignatures += stat.signatures;

      if (stat._id === "active") petitions.active = stat.count;
      if (stat._id === "under_review") petitions.underReview = stat.count;
      if (stat._id === "closed") petitions.closed = stat.count;
    });

    /* ================= POLL STATS ================= */

    const pollStats = await Poll.aggregate([
      { $match: match },

      {
        $project: {
          isActive: {
            $or: [
              { $eq: ["$expiresAt", null] },
              { $gt: ["$expiresAt", new Date()] }
            ]
          },
          votes: {
            $sum: "$options.votes"
          }
        }
      },

      {
        $group: {
          _id: "$isActive",
          count: { $sum: 1 },
          totalVotes: { $sum: "$votes" }
        }
      }
    ]);

    let polls = {
      total: 0,
      active: 0,
      closed: 0
    };

    let totalVotes = 0;

    pollStats.forEach(stat => {
      polls.total += stat.count;
      totalVotes += stat.totalVotes;

      if (stat._id === true) polls.active = stat.count;
      else polls.closed = stat.count;
    });

    /* ================= RESPONSE ================= */

    res.json({
      petitions,
      polls,
      engagement: {
        votes: totalVotes,
        signatures: totalSignatures
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Report generation failed"
    });
  }
};