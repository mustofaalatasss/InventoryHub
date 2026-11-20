using System.ComponentModel.DataAnnotations;

namespace InventoryHub.Models
{
    public class CreateItemDto
    {
        [Required(ErrorMessage = "Item name is required.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required.")]
        public string Category { get; set; } = string.Empty;

        [Range(0, 100000, ErrorMessage = "Quantity must be non-negative.")]
        public int Quantity { get; set; }

        [Range(0.01, 100000.0, ErrorMessage = "Price must be greater than zero.")]
        public decimal Price { get; set; }
    }

    public class UpdateItemDto
    {
        public string? Name { get; set; }
        public string? Category { get; set; }
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }
    }
}
