namespace Licitatrack.Api.DTOs;

public class HistoricoProcessoResponseDTO
{
    public int Id { get; set; }
    public int ProcessoId { get; set; }
    public string? SituacaoAnterior { get; set; }
    public string SituacaoNova { get; set; } = string.Empty;
    public string? Observacao { get; set; }
    public DateTime DataAlteracao { get; set; }
}
