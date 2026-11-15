using System.Text.RegularExpressions;
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

    public async Task<List<ProcessoResponseDTO>> Listar()
    {
        var processos = await _repository.Listar();

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

    public async Task<ProcessoResponseDTO?> BuscarPorId(int id)
    {
        var processo = await _repository.BuscarPorId(id);

        if (processo == null)
            return null;

        return new ProcessoResponseDTO
        {
            Id = processo.Id,
            Numero = processo.Numero,
            Objeto = processo.Objeto,
            Modalidade = processo.Modalidade,
            Secretaria = processo.Secretaria,
            DataAbertura = processo.DataAbertura,
            Situacao = processo.Situacao,
            DataCadastro = processo.DataCadastro
        };
    }

    public async Task<ProcessoResponseDTO> Criar(CriarProcessoDTO dto)
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

        var criado = await _repository.Inserir(processo);

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

    public async Task<ProcessoResponseDTO?> Atualizar(int id, EditarProcessoDTO dto)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrWhiteSpace(dto.Numero) || !Regex.IsMatch(dto.Numero, @"^\d{3}/\d{4}$"))
            throw new ArgumentException("Informe o número no formato 001/2026.");

        if (string.IsNullOrWhiteSpace(dto.Objeto))
            throw new ArgumentException("O objeto é obrigatório.");

        if (string.IsNullOrWhiteSpace(dto.Modalidade) || dto.Modalidade.Length > 50)
            throw new ArgumentException("A modalidade é obrigatória e deve conter no máximo 50 caracteres.");

        if (string.IsNullOrWhiteSpace(dto.Secretaria) || dto.Secretaria.Length > 100)
            throw new ArgumentException("A secretaria é obrigatória e deve conter no máximo 100 caracteres.");

        if (!dto.DataAbertura.HasValue || dto.DataAbertura.Value == default)
            throw new ArgumentException("A data de abertura é obrigatória.");

        var processo = await _repository.BuscarPorId(id);
        if (processo == null)
            return null;

        if (await _repository.ExisteNumero(dto.Numero, id))
            throw new InvalidOperationException($"Já existe um processo com o número '{dto.Numero}'.");

        processo.Numero = dto.Numero;
        processo.Objeto = dto.Objeto;
        processo.Modalidade = dto.Modalidade;
        processo.Secretaria = dto.Secretaria;
        processo.DataAbertura = dto.DataAbertura.Value;

        await _repository.Atualizar(processo);

        return new ProcessoResponseDTO
        {
            Id = processo.Id,
            Numero = processo.Numero,
            Objeto = processo.Objeto,
            Modalidade = processo.Modalidade,
            Secretaria = processo.Secretaria,
            DataAbertura = processo.DataAbertura,
            Situacao = processo.Situacao,
            DataCadastro = processo.DataCadastro
        };
    }

    private static readonly HashSet<string> SituacoesPermitidas = new(StringComparer.Ordinal)
    {
        "Planejado",
        "Em andamento",
        "Concluido",
        "Cancelado"
    };

    public async Task<ProcessoResponseDTO?> AtualizarSituacao(int id, AtualizarSituacaoDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Situacao) || !SituacoesPermitidas.Contains(dto.Situacao))
            throw new ArgumentException("Situação inválida. Valores aceitos: Planejado, Em andamento, Concluido, Cancelado.");

        var processo = await _repository.BuscarPorId(id);
        if (processo == null)
            return null;

        if (processo.Situacao != dto.Situacao)
        {
            await _repository.AtualizarSituacao(id, processo.Situacao, dto.Situacao, dto.Observacao);
            processo.Situacao = dto.Situacao;
        }

        return new ProcessoResponseDTO
        {
            Id = processo.Id,
            Numero = processo.Numero,
            Objeto = processo.Objeto,
            Modalidade = processo.Modalidade,
            Secretaria = processo.Secretaria,
            DataAbertura = processo.DataAbertura,
            Situacao = processo.Situacao,
            DataCadastro = processo.DataCadastro
        };
    }

    public async Task<List<HistoricoProcessoResponseDTO>?> ListarHistorico(int processoId)
    {
        var processo = await _repository.BuscarPorId(processoId);
        if (processo == null)
            return null;

        var historico = await _repository.ListarHistorico(processoId);

        return historico.Select(h => new HistoricoProcessoResponseDTO
        {
            Id = h.Id,
            ProcessoId = h.ProcessoId,
            SituacaoAnterior = h.SituacaoAnterior,
            SituacaoNova = h.SituacaoNova,
            Observacao = h.Observacao,
            DataAlteracao = h.DataAlteracao
        }).ToList();
    }
}
