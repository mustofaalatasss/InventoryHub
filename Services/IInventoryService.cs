using InventoryHub.Models;

namespace InventoryHub.Services
{
    public interface IInventoryService
    {
        Task<(IEnumerable<InventoryItem> Items, PaginationMeta Meta)> GetItemsAsync(string? search, string? category, int page, int limit);
        Task<InventoryItem?> GetByIdAsync(int id);
        Task<InventoryItem> CreateAsync(CreateItemDto dto);
        Task<InventoryItem?> UpdateAsync(int id, UpdateItemDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
