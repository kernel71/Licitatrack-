using Microsoft.AspNetCore.Mvc;
using Licitatrack.Api.DTOs;
using Licitatrack.Api.Services;
using MySqlConnector;

namespace Licitatrack.Api.Controllers;

[ApiController]
[Route("api/processos")]
public class ProcessosController : ControllerBase
{
    private readonly ProcessoService _service;

    public ProcessosController(ProcessoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProcessoResponseDTO>>> Listar()
    {
        var processos = await _service.Listar();
        return Ok(processos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProcessoResponseDTO>> BuscarPorId(int id)
    {
        if (id <= 0)
            return BadRequest();

        var processo = await _service.BuscarPorId(id);
        if (processo == null)
            return NotFound();

        return Ok(processo);
    }

    [HttpPost]
    public async Task<ActionResult<ProcessoResponseDTO>> Criar([FromBody] CriarProcessoDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var criado = await _service.Criar(dto);
            return CreatedAtAction(nameof(Listar), new { }, criado);
        }
        catch (MySqlException ex) when (ex.Number == 1062)
        {
            return Conflict(new { mensagem = $"Já existe um processo com o número '{dto.Numero}'." });
        }
    }
}
