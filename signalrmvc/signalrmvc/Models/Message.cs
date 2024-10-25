using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace signalrmvc.Models
{
    public class Message
    {
        public string Sender { get; set; }
        public string Context { get; set; }
        public DateTime SentAt { get; set; }
    }
}
