using System.ComponentModel.DataAnnotations;

namespace Licitatrack.Api.DTOs;

public class AtualizarSituacaoDTO
{
    [Required(ErrorMessage = "A situação é obrigatória.")]
    [RegularExpression(
        "^(Planejado|Em andamento|Concluido|Cancelado)$",
        ErrorMessage = "Situação inválida. Valores aceitos: Planejado, Em andamento, Concluido, Cancelado.")]
    public string Situacao { get; set; } = string.Empty;
}
