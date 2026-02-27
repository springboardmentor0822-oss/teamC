const Notification = require('../models/Notification');

const createNotification = 
async (userId, message, petitionId) => {

    await Notification.create({
        user: userId,
        message,
        petition: petitionId
    });
};

module.exports = createNotification;