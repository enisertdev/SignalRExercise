let isInRoom = false;

var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

connection.on("SuccessMessage",
    (value, username) => {
        var li = document.createElement("li");
        li.textContent = value;
        document.getElementById("messagesList").appendChild(li);
    });

connection.on("UpdatePeopleInRoom",
    (value) => {
        var peopleInRoomList = document.getElementById("peopleInRoom");
        peopleInRoomList.innerHTML = "";
        value.forEach(function(user) {
            var li = document.createElement("li");
            li.textContent = user;
            peopleInRoomList.appendChild(li);
        });
    });

connection.on("ErrorMessage",
    (value) => {
        alert(value);
    });

connection.on("UserLeftRoom",
    (value) => {
        var li = document.createElement("li");
        li.textContent = value;
        document.getElementById("messagesList").appendChild(li);
    });

connection.on("ReceiveMessage",
    (value) => {
        var li = document.createElement("li");
        li.textContent = value;
        document.getElementById("messagesList").appendChild(li);
    });

connection.on("AllRooms",
    (value) => {
        var roomsList = document.getElementById("roomsList");
        roomsList.innerHTML = "";
        if (value.length === 0) {
            console.log("No rooms available");
            return;
        }
        value.forEach(room => {
            var li = document.createElement("li");
            li.textContent = room;
            roomsList.appendChild(li);
            console.log(`${room} odanızın adı`);
        });
    });

connection.on("GetNumberOfOnlinePeople",
    (value) => {
        document.getElementById("peopleOnlineCount").textContent = value.toString();
    });



// Bağlantı başarılıysa
connection.start().then(async function () {
    console.log("Connected to User Hub");
    await connection.invoke("ShowAvailableRooms");
});



document.getElementById("enterRoomButton").onclick = async () => {
    if (isInRoom) {
        return;
    }
    isInRoom = true;
    var user = document.getElementById("usernameInput").value;
    var roomId = document.getElementById("roomIdInput").value;
    document.getElementById("leaveRoomButton").style.display = "block";
    document.getElementById("messageInput").style.display = "block";
    document.getElementById("message").style.display = "block";

    await connection.invoke("JoinRoom", user, roomId);
};

document.getElementById("leaveRoomButton").onclick = async () => {
    if (!isInRoom) return;
    var user = document.getElementById("usernameInput").value;
    await connection.invoke("LeaveRoom", user);
    var li = document.createElement("li");
    li.textContent = `${user} have left the room.`;
    isInRoom = false;
    document.getElementById("messagesList").appendChild(li);
    document.getElementById("peopleInRoom").innerHTML = "";
    document.getElementById("leaveRoomButton").style.display = "none";
    document.getElementById("message").style.display = "none";

    console.log(`LeaveRoom invoked for: ${user}`); // Log after invoking
};

document.getElementById("sendButton").onclick = async() => {
    var username = document.getElementById("usernameInput").value;
    var message = document.getElementById("messageInput").value;
    await connection.invoke("SendMessage", username, message);
}


