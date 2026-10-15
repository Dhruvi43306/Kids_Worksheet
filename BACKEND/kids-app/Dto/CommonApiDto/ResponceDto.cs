using System.Security.Policy;

namespace kids_app.Dto.CommonApiDto
{
    public class ResponceDto<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T? Data { get; set; }

        public List<string> Errors { get; set; } = new List<string>();
    }
}
