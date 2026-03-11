const Notification =
  require("../models/Notification");

let io;

/* ================= INIT SOCKET ================= */

const initSocket = (_io) => {
  io = _io;
};

/* ================= CREATE NOTIFICATION ================= */

const createNotification = async (
  userId,
  type,
  message,
  petitionId
) => {

  try {

    // ✅ Save to database
    const notification =
      await Notification.create({
        user: userId,
        type,
        message,
        petition: petitionId
      });

    // ✅ Emit to user's ROOM
    // (Room name = userId)
    if (io) {
      io.to(userId)
        .emit("newNotification", notification);
    }

    return notification;

  } catch (error) {

    console.error(
      "Notification creation failed:",
      error.message
    );

    return null;
  }
};

module.exports = {
  initSocket,
  createNotification
};