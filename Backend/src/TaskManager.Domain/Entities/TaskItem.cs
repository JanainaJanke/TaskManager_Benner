﻿namespace TaskManager.Domain.Entities
{
    public class TaskItem
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime DueDate { get; set; }

        public bool IsCompleted { get; set; }

        public Guid UserId { get; set; }

        public User User { get; set; }
    }
}