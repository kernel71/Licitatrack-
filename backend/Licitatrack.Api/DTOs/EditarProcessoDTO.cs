using System.ComponentModel.DataAnnotations;

namespace Licitatrack.Api.DTOs;

public class EditarProcessoDTO
{
    [Required]
    [MaxLength(50)]
    [RegularExpression(@"^\d{3}/\d{4}$", ErrorMessage = "Informe o número no formato 001/2026.")]
    public string Numero { get; set; } = string.Empty;

    [Required]
    public string Objeto { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Modalidade { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Secretaria { get; set; } = string.Empty;

    [Required]
    public DateTime? DataAbertura { get; set; }
}
