const  Petition = require("../models/Petition");

exports.getOfficialPetitions = async (req, res, next) => {
    try {
        const petitions = await Petition.find({
            location: req.user.location,
            status: "open"
        }).populate("createdBy", "name")
        .sort({ createdAt: -1 });

        res.json({
            count: petitions.length,
            petitions
        });
    } catch (error) {
        next(error);
    }
};
