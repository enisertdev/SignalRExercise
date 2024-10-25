using Microsoft.AspNetCore.SignalR;
using signalrmvc.Models;

public class ChatHub : Hub
{
    private static List<Message> _messages = new List<Message>();
    private static Dictionary<string, List<string>> _rooms = new Dictionary<string, List<string>>();
    public static int peopleOnline { get; set; } = 0;
    
    public override Task OnConnectedAsync()
    {
        peopleOnline++;
        Clients.All.SendAsync("GetNumberOfOnlinePeople", peopleOnline);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        peopleOnline--;
        Clients.All.SendAsync("GetNumberOfOnlinePeople", peopleOnline);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task JoinRoom(string username, string roomId)
    {
        var existingRoom = _rooms.FirstOrDefault(r => r.Value.Contains(username)).Key;
        if (existingRoom != null)
        {
            await Clients.Caller.SendAsync("ErrorMessage", "you are already in a room");
            return;
        }

        if (!_rooms.ContainsKey(roomId))
        {
            _rooms[roomId] = new List<string>();
        }
        _rooms[roomId].Add(username);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        Console.WriteLine("test");
        await Clients.Group(roomId).SendAsync("SuccessMessage", $"{username} has joined to room", username);
        await Clients.Group(roomId).SendAsync("UpdatePeopleInRoom", _rooms[roomId]);
        await ShowAvailableRooms();
    }

    public async Task LeaveRoom(string username)
    {
        var roomId = _rooms.FirstOrDefault(r => r.Value.Contains(username)).Key;
        if (roomId != null)
        {
            _rooms[roomId].Remove(username);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserLeftRoom", $"{username} Has Left the room");
            await Clients.Group(roomId).SendAsync("UpdatePeopleInRoom", _rooms[roomId]);
            if (!_rooms[roomId].Any())
            {
                _rooms.Remove(roomId);
            }
            await ShowAvailableRooms();

        }
    }

    public async Task SendMessage(string username, string message)
    {
        var getRoomId = _rooms.FirstOrDefault(r => r.Value.Contains(username)).Key;
        if (getRoomId != null)
        {
            await Clients.Group(getRoomId).SendAsync("ReceiveMessage", message);
        }

    }

    public async Task ShowAvailableRooms()
    {
        var rooms = _rooms.Keys.ToList();
        await Clients.All.SendAsync("AllRooms", rooms);
    }

}