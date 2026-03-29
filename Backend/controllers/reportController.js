const Petition = require("../models/Petition");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");

const getReports = async (req, res) => {
  try {
    const { location, days } = req.query;

    // DATE FILTER
    let dateFilter = {};
    if (days && days !== "all") {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(days));
      dateFilter = { createdAt: { $gte: fromDate } };
    }

    // LOCATION FILTER
    let locationFilter = {};
    if (location && location.trim() !== "") {
      locationFilter = { location };
    }

    // TOTAL COUNTS

    const totalPetitions = await Petition.countDocuments({
      ...locationFilter,
      ...dateFilter,
    });

    const totalPolls = await Poll.countDocuments({
      ...locationFilter,
      ...dateFilter,
    });

    const totalVotes = await Vote.countDocuments(dateFilter);

    // ✅ FIXED SIGNATURE COUNT

    const petitionsForSignatures = await Petition.find({
      //...locationFilter,
    }); //.select("signatures");

    const totalSignatures = petitionsForSignatures.reduce(
      (sum, p) => sum + (p.signatures?.length || 0),
      0
    );

    // PETITION STATUS

    const active = await Petition.countDocuments({
      ...locationFilter,
      status: "active",
    });

    const underReview = await Petition.countDocuments({
      ...locationFilter,
      status: "under_review",
    });

    const closed = await Petition.countDocuments({
      ...locationFilter,
      status: "closed",
    });

    // POLL ACTIVITY

    const activePolls = await Poll.countDocuments({
      ...locationFilter,
      status: "active",
    });

    const closedPolls = await Poll.countDocuments({
      ...locationFilter,
      status: "closed",
    });

    // FINAL RESPONSE

    res.status(200).json({
      totals: {
        totalPetitions,
        totalPolls,
        totalVotes,
        totalSignatures,
      },
      petitionStatus: {
        active,
        underReview,
        closed,
      },
      pollActivity: {
        activePolls,
        closedPolls,
      },
    });
  } catch (error) {
    console.error("Reports Error:", error);
    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

module.exports = { getReports };