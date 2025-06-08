namespace TaskManager.Application.Utils
{
    public static class DateValidation
    {
        public static bool BeAValidFutureDate(DateTime date)
        {
            // Valida se a data é futura ou o dia atual (para permitir tarefas para hoje)
            return date >= DateTime.Today;
        }
    }
}
