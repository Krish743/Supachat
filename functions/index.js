const functions = require("firebase-functions");
const Filter = require("bad-words");

exports.filterProfanity = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snap) => {
    const filter = new Filter();
    const message = snap.data();

    // Check if the message contains profanity
    if (filter.isProfane(message.text)) {
      // Clean the text
      const cleanText = filter.clean(message.text);
      
      // Update the message with cleaned text
      try {
        await snap.ref.update({
          text: cleanText,
          containedProfanity: true
        });
      } catch (error) {
        console.error("Error updating message:", error);
      }
    }
    return null;
  });