namespace Licitatrack.Api.Models;

public class ProcessoLicitatorio
{
    public int Id { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Objeto { get; set; } = string.Empty;
    public string Modalidade { get; set; } = string.Empty;
    public string Secretaria { get; set; } = string.Empty;
    public DateTime DataAbertura { get; set; }
    public string Situacao { get; set; } = "Planejado";
    public DateTime DataCadastro { get; set; }
}
