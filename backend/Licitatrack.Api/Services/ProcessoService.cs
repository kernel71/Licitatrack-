using Licitatrack.Api.DTOs;
using Licitatrack.Api.Models;
using Licitatrack.Api.Repositories;

namespace Licitatrack.Api.Services;

public class ProcessoService
{
    private readonly ProcessoRepository _repository;

    public ProcessoService(ProcessoRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ProcessoResponseDTO>> ListarAsync()
    {
        var processos = await _repository.ListarAsync();

        return processos.Select(p => new ProcessoResponseDTO
        {
            Id = p.Id,
            Numero = p.Numero,
            Objeto = p.Objeto,
            Modalidade = p.Modalidade,
            Secretaria = p.Secretaria,
            DataAbertura = p.DataAbertura,
            Situacao = p.Situacao,
            DataCadastro = p.DataCadastro
        }).ToList();
    }

    public async Task<ProcessoResponseDTO> CriarAsync(CriarProcessoDTO dto)
    {
        var processo = new ProcessoLicitatorio
        {
            Numero       = dto.Numero,
            Objeto       = dto.Objeto,
            Modalidade   = dto.Modalidade,
            Secretaria   = dto.Secretaria,
            DataAbertura = dto.DataAbertura!.Value,
            Situacao     = dto.Situacao,
            DataCadastro = DateTime.UtcNow
        };

        var criado = await _repository.InserirAsync(processo);

        return new ProcessoResponseDTO
        {
            Id           = criado.Id,
            Numero       = criado.Numero,
            Objeto       = criado.Objeto,
            Modalidade   = criado.Modalidade,
            Secretaria   = criado.Secretaria,
            DataAbertura = criado.DataAbertura,
            Situacao     = criado.Situacao,
            DataCadastro = criado.DataCadastro
        };
    }
}
