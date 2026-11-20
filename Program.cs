using System.Text.Json;
using System.Text.Json.Serialization;
using InventoryHub.Services;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Service Configuration (Activity 1 & 4)
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Activity 3: Ensuring standardized camelCase JSON serialization
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Activity 4: In-Memory Caching for performance optimization
builder.Services.AddMemoryCache();

// Dependency Injection for Inventory service
builder.Services.AddSingleton<IInventoryService, InventoryService>();

// Activity 2: Cross-Origin Resource Sharing (CORS) resolution
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ==========================================
// 2. HTTP Request Pipeline (Activity 2)
// ==========================================
app.UseCors("AllowAll");

// Serve front-end static files (HTML, CSS, JS) from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

// Fallback to front-end index if route not found
app.MapFallbackToFile("index.html");

app.Run();
