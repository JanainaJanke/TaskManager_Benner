namespace TaskManager.Application.Commands
{
    public class UpdateTaskItemCommand
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public Guid UserId { get; set; } // Preenchimento via controller
    }
}
