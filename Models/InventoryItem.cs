using System.ComponentModel.DataAnnotations;

namespace InventoryHub.Models
{
    public class InventoryItem
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Item name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required.")]
        public string Category { get; set; } = string.Empty;

        [Range(0, 100000, ErrorMessage = "Quantity must be a positive integer.")]
        public int Quantity { get; set; }

        [Range(0.01, 100000.0, ErrorMessage = "Price must be greater than zero.")]
        public decimal Price { get; set; }

        public string Status { get; set; } = "In Stock";
    }
}
