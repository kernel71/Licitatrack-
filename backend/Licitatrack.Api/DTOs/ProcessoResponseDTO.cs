namespace Licitatrack.Api.DTOs;

public class ProcessoResponseDTO
{
    public int Id { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Objeto { get; set; } = string.Empty;
    public string Modalidade { get; set; } = string.Empty;
    public string Secretaria { get; set; } = string.Empty;
    public DateTime DataAbertura { get; set; }
    public string Situacao { get; set; } = string.Empty;
    public DateTime DataCadastro { get; set; }
}
