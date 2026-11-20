namespace InventoryHub.Models
{
    // Activity 3: Standardized JSON Response Pattern
    public class ApiResponse<T>
    {
        public string Status { get; set; } = "success";
        public int StatusCode { get; set; } = 200;
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public PaginationMeta? Meta { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> Success(T data, string message = "Success", int statusCode = 200, PaginationMeta? meta = null)
        {
            return new ApiResponse<T>
            {
                Status = "success",
                StatusCode = statusCode,
                Message = message,
                Data = data,
                Meta = meta,
                Timestamp = DateTime.UtcNow
            };
        }

        public static ApiResponse<T> Error(string message, int statusCode = 400, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Status = "error",
                StatusCode = statusCode,
                Message = message,
                Data = default,
                Timestamp = DateTime.UtcNow
            };
        }
    }

    public class PaginationMeta
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages { get; set; }
        public bool HasNext { get; set; }
        public bool HasPrev { get; set; }
    }
}
