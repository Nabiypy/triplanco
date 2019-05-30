const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.requestNotifications = functions.database.ref('Notifications/{user_Id}/unread/{notificationId}').onWrite((change, context) => {
    var user_Id = context.params.user_Id;
    //var notificationId = context.params.notificationId;
    var notifyData = change.after.val();
    var sender_id = notifyData.Id
        // Query sender profile and user token
    var fromUserQueryName = admin.database().ref(`/users/${sender_id}/Name`).once('value');
    //var fromUserQueryPicture = admin.database().ref(`/users/${sender_id}/Photo`).once('value');
    var userDeviceToken = admin.database().ref(`/users/${user_Id}/pushToken`).once('value');
    // return Queries
    return Promise.all([fromUserQueryName, userDeviceToken]).then(result => {
            var fromUserDisplayName = result[0].val();
            var userDisplayToken = result[1].val();

            // Notification details.
            const payload = {
                notification: {
                    title: 'Friend Request!',
                    body: `${fromUserDisplayName} Sent You Request.`,
                    icon: 'assets/imgs/chatme.png',
                    sound: 'default'
                }
            };
            return admin.messaging().sendToDevice(userDisplayToken, payload)
                .then(response => {
                    console.log('Notification sent')
                })
                .catch(error => {
                    console.log('Error sending Notification')
                })
        })
        // })
})
exports.conversationNotifications = functions.database.ref('Conversations/{user_Id}/{conversationId}').onWrite((change, context) => {
    var user_Id = context.params.user_Id;
    var conversationId = context.params.conversationId;
    var messageData = change.after.val();
    //console.log(user_Id + 'from convo with' + sender_Id)

    //get message details
    var message = admin.database().ref(`/Conversations/${user_Id}/${conversationId}/message`).once('value');
    var senderId = admin.database().ref(`/Conversations/${user_Id}/${conversationId}/Id`).once('value');

    // return Queries
    return Promise.all([message, senderId]).then(result => {
        var messageDisplay = result[0].val();
        var senderIdDisplay = result[1].val();

        // get sender information and user token
        var fromUserQueryName = admin.database().ref(`/users/${senderIdDisplay}/Name`).once('value');
        var userDeviceToken = admin.database().ref(`/users/${user_Id}/pushToken`).once('value');
        // return Queries
        return Promise.all([fromUserQueryName, userDeviceToken]).then(result => {
            var fromUserDisplayName = result[0].val();
            var userDisplayToken = result[1].val();

            // Notification details
            const payload = {
                notification: {
                    title: fromUserDisplayName,
                    body: messageDisplay,
                    icon: 'assets/imgs/chatme.png',
                    sound: 'default'
                }
            };
            return admin.messaging().sendToDevice(userDisplayToken, payload)
                .then(response => {
                    console.log('message sent')
                })
                .catch(error => {
                    console.log('Error sending message')
                })
        })
    })
})