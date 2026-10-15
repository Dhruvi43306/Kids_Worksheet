using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace kids_app.Models
{
    public class VisualStyleItem
    {
        [Key]
     public int VisualStyleItemId { get; set; }

    [ForeignKey(nameof(VisualStyleId))]
    public int VisualStyleId { get; set; }
    public VisualStyle visualStyle { get; set; }

   public string? ItemName { get; set; }
    public string? Icon { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }
    }
}
