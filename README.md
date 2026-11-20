# InventoryHub - Full-Stack C# ASP.NET Core Integration Project

InventoryHub is an enterprise-grade full-stack inventory management web application developed in **C# / ASP.NET Core 8.0** and vanilla JavaScript, designed and refined using **Microsoft Copilot**.

This project synthesizes four key integration activities:
1. **Generating and Refining Integration Code** (REST API endpoints & client fetch calls)
2. **Debugging and Fixing Integration Issues** (CORS, model validation, and HTTP status codes)
3. **Creating and Managing Structured JSON** (`ApiResponse<T>` envelope & camelCase serialization)
4. **Optimizing Integration Code for Performance** (Debouncing, server-side LINQ pagination, and memory caching)

---

## 🏛️ Architecture & Project Structure

```
InventoryHub/
├── Controllers/
│   └── InventoryController.cs       # RESTful API Controller (CRUD, validation, HTTP status codes)
├── Models/
│   ├── InventoryItem.cs             # Core entity model with DataAnnotations
│   ├── ApiResponse.cs               # Standardized JSON response envelope pattern
│   └── ItemDto.cs                   # Create and Update Data Transfer Objects
├── Services/
│   ├── IInventoryService.cs         # Service contract for inventory business logic
│   └── InventoryService.cs          # Business logic, LINQ pagination, and IMemoryCache
├── wwwroot/
│   ├── index.html                   # Modern frontend interface
│   ├── css/styles.css               # Clean responsive styling
│   └── js/app.js                    # Client-side API fetch client & debounced search
├── Program.cs                       # ASP.NET Core pipeline, CORS, caching, and static files
├── appsettings.json                 # Application configuration
├── InventoryHub.csproj              # .NET 8.0 Web SDK project file
└── README.md                        # Documentation & Copilot Reflective Summary
```

---

## 🚀 Running the Project

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)

### Run with .NET CLI
```bash
# Clone the repository
git clone https://github.com/mustofaalatasss/InventoryHub.git
cd InventoryHub

# Run the ASP.NET Core application
dotnet run
```
Navigate to `http://localhost:5000` (or `https://localhost:5001`) in your browser.

---

## 📖 Reflective Summary: Assistance by Microsoft Copilot

Throughout the development lifecycle of **InventoryHub**, Microsoft Copilot was utilized as an AI pair programming companion across four essential milestones:

### Activity 1: Generating and Refining Integration Code
- **C# Controller & Frontend Generation**: Prompted Microsoft Copilot to scaffold an ASP.NET Core `InventoryController` implementing standard REST verbs (`[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]`) mapped to an asynchronous `IInventoryService`.
- **Client-Side Integration**: Copilot generated robust JavaScript `fetch` routines matching the controller endpoints with proper parameter serialization.

### Activity 2: Debugging and Fixing Integration Issues
- **CORS Configuration**: Copilot quickly diagnosed origin mismatch issues between client and server, generating the appropriate `builder.Services.AddCors()` policy in `Program.cs`.
- **Input Validation**: Copilot recommended `System.ComponentModel.DataAnnotations` (`[Required]`, `[Range]`, `[StringLength]`) on DTOs, paired with `ModelState.IsValid` checks in the controller, guaranteeing explicit 400 Bad Request responses with descriptive error lists instead of unhandled exceptions.

### Activity 3: Creating and Managing JSON with Microsoft Copilot
- **Uniform Envelope**: Guided by Copilot, a generic `ApiResponse<T>` wrapper class was created to ensure every server response follows a consistent contract:
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "Inventory items retrieved successfully",
    "data": [ ... ],
    "meta": { "total": 8, "page": 1, "limit": 5, "totalPages": 2, "hasNext": true, "hasPrev": false },
    "timestamp": "2026-11-20T06:40:00Z"
  }
  ```
- **Serialization Policy**: Copilot configured `JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase` in `Program.cs` for smooth compatibility between C# PascalCase naming conventions and JavaScript camelCase standards.

### Activity 4: Optimizing Integration Code for Performance
- **Client Debouncing**: Copilot suggested implementing a 300ms debounce timer on keystroke search inputs in `app.js`, eliminating redundant API calls while typing.
- **Server-Side Pagination & Caching**: Copilot implemented LINQ pagination (`.Skip()`, `.Take()`) to avoid loading large record sets into memory simultaneously, and structured `IMemoryCache` invalidation triggers upon create, update, and delete actions.

---

## 📝 License
This project is open-source under the MIT License.
