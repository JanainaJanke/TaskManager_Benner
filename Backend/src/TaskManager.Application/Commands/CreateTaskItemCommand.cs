namespace TaskManager.Application.Commands
{
    public class CreateTaskItemCommand
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public Guid UserId { get; set; } // Preenchimento via controller
    }
}
