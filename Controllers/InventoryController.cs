using InventoryHub.Models;
using InventoryHub.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventoryHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
        {
            _inventoryService = inventoryService;
            _logger = logger;
        }

        // ==========================================
        // GET: api/inventory (Activity 1 & 3 & 4)
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int limit = 5)
        {
            try
            {
                var (items, meta) = await _inventoryService.GetItemsAsync(search, category, page, limit);
                var response = ApiResponse<IEnumerable<InventoryItem>>.Success(items, "Inventory items retrieved successfully", 200, meta);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching inventory items");
                return StatusCode(500, ApiResponse<string>.Error("Internal server error while fetching inventory", 500));
            }
        }

        // ==========================================
        // GET: api/inventory/{id}
        // ==========================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _inventoryService.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound(ApiResponse<string>.Error($"Inventory item with ID {id} was not found", 404));
            }

            return Ok(ApiResponse<InventoryItem>.Success(item, "Item retrieved successfully"));
        }

        // ==========================================
        // POST: api/inventory (Activity 2 Validation)
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateItemDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<List<string>>.Error("Validation failed", 400, errors));
            }

            var created = await _inventoryService.CreateAsync(dto);
            var response = ApiResponse<InventoryItem>.Success(created, "Item successfully added to inventory", 201);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, response);
        }

        // ==========================================
        // PUT: api/inventory/{id}
        // ==========================================
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateItemDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<string>.Error("Invalid input payload", 400));
            }

            var updated = await _inventoryService.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(ApiResponse<string>.Error($"Item with ID {id} not found", 404));
            }

            return Ok(ApiResponse<InventoryItem>.Success(updated, "Item updated successfully"));
        }

        // ==========================================
        // DELETE: api/inventory/{id}
        // ==========================================
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _inventoryService.DeleteAsync(id);
            if (!success)
            {
                return NotFound(ApiResponse<string>.Error($"Item with ID {id} not found", 404));
            }

            return Ok(ApiResponse<bool>.Success(true, "Item deleted successfully"));
        }
    }
}
