namespace Licitatrack.Api.Models;

public class HistoricoProcesso
{
    public int Id { get; set; }
    public int ProcessoId { get; set; }
    public string? SituacaoAnterior { get; set; }
    public string SituacaoNova { get; set; } = string.Empty;
    public string? Observacao { get; set; }
    public DateTime DataAlteracao { get; set; }
}
