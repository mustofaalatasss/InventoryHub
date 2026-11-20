using InventoryHub.Models;
using Microsoft.Extensions.Caching.Memory;

namespace InventoryHub.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly List<InventoryItem> _items = new();
        private readonly IMemoryCache _cache;
        private readonly string _cacheKey = "all_inventory_items";

        public InventoryService(IMemoryCache cache)
        {
            _cache = cache;

            // Seed initial inventory dataset
            _items.AddRange(new List<InventoryItem>
            {
                new() { Id = 1, Name = "Wireless Mechanical Keyboard", Category = "Electronics", Quantity = 45, Price = 89.99m, Status = "In Stock" },
                new() { Id = 2, Name = "Ergonomic Office Chair", Category = "Furniture", Quantity = 12, Price = 199.50m, Status = "In Stock" },
                new() { Id = 3, Name = "27-inch 4K Monitor", Category = "Electronics", Quantity = 5, Price = 349.00m, Status = "Low Stock" },
                new() { Id = 4, Name = "USB-C Multi-port Hub", Category = "Accessories", Quantity = 0, Price = 29.99m, Status = "Out of Stock" },
                new() { Id = 5, Name = "Noise Cancelling Headphones", Category = "Audio", Quantity = 28, Price = 149.99m, Status = "In Stock" },
                new() { Id = 6, Name = "Adjustable Standing Desk", Category = "Furniture", Quantity = 8, Price = 299.00m, Status = "Low Stock" },
                new() { Id = 7, Name = "Webcam 1080p HD", Category = "Accessories", Quantity = 50, Price = 49.99m, Status = "In Stock" },
                new() { Id = 8, Name = "Aluminum Laptop Stand", Category = "Accessories", Quantity = 35, Price = 39.99m, Status = "In Stock" }
            });
        }

        // Activity 4: LINQ-based filtering, search, and pagination
        public Task<(IEnumerable<InventoryItem> Items, PaginationMeta Meta)> GetItemsAsync(string? search, string? category, int page, int limit)
        {
            var query = _items.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(i => i.Name.ToLower().Contains(term) || i.Category.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(i => i.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            var total = query.Count();
            var totalPages = (int)Math.Ceiling(total / (double)limit);
            if (totalPages < 1) totalPages = 1;

            var pagedItems = query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList();

            var meta = new PaginationMeta
            {
                Total = total,
                Page = page,
                Limit = limit,
                TotalPages = totalPages,
                HasNext = page < totalPages,
                HasPrev = page > 1
            };

            return Task.FromResult(((IEnumerable<InventoryItem>)pagedItems, meta));
        }

        public Task<InventoryItem?> GetByIdAsync(int id)
        {
            var item = _items.FirstOrDefault(i => i.Id == id);
            return Task.FromResult(item);
        }

        public Task<InventoryItem> CreateAsync(CreateItemDto dto)
        {
            var newId = _items.Any() ? _items.Max(i => i.Id) + 1 : 1;
            var status = DetermineStatus(dto.Quantity);

            var item = new InventoryItem
            {
                Id = newId,
                Name = dto.Name.Trim(),
                Category = dto.Category.Trim(),
                Quantity = dto.Quantity,
                Price = dto.Price,
                Status = status
            };

            _items.Add(item);
            _cache.Remove(_cacheKey); // Invalidate cache

            return Task.FromResult(item);
        }

        public Task<InventoryItem?> UpdateAsync(int id, UpdateItemDto dto)
        {
            var item = _items.FirstOrDefault(i => i.Id == id);
            if (item == null) return Task.FromResult<InventoryItem?>(null);

            if (!string.IsNullOrWhiteSpace(dto.Name)) item.Name = dto.Name.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Category)) item.Category = dto.Category.Trim();
            if (dto.Quantity.HasValue)
            {
                item.Quantity = dto.Quantity.Value;
                item.Status = DetermineStatus(dto.Quantity.Value);
            }
            if (dto.Price.HasValue) item.Price = dto.Price.Value;

            _cache.Remove(_cacheKey); // Invalidate cache
            return Task.FromResult<InventoryItem?>(item);
        }

        public Task<bool> DeleteAsync(int id)
        {
            var item = _items.FirstOrDefault(i => i.Id == id);
            if (item == null) return Task.FromResult(false);

            _items.Remove(item);
            _cache.Remove(_cacheKey); // Invalidate cache
            return Task.FromResult(true);
        }

        private static string DetermineStatus(int quantity)
        {
            if (quantity <= 0) return "Out of Stock";
            if (quantity < 10) return "Low Stock";
            return "In Stock";
        }
    }
}
