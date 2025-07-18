const yup = require("yup");

const createChatroomSchema = yup.object({
  name: yup
    .string()
    .max(100, "Chatroom name must not exceed 100 characters")
    .required("Chatroom name is required")
});

const sendMessageSchema = yup.object({
  message: yup
    .string()
    .max(1000, "Message must not exceed 1000 characters")
    .required("Message is required")
});

module.exports = {
  createChatroomSchema,
  sendMessageSchema
};
