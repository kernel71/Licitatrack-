using MySqlConnector;
using Licitatrack.Api.Models;

namespace Licitatrack.Api.Repositories;

public class ProcessoRepository
{
    private readonly string _connectionString;

    public ProcessoRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException(
                "String de conexão não configurada.");
    }

    public async Task<List<ProcessoLicitatorio>> ListarAsync()
    {
        var processos = new List<ProcessoLicitatorio>();

        await using var connection =
            new MySqlConnection(_connectionString);

        await connection.OpenAsync();
            const string sql = @" SELECT
                id, numero, objeto, modalidade,
                secretaria, data_abertura, situacao,
                data_cadastro
            FROM processos_licitatorios
            ORDER BY id DESC;
            ";

        await using var command =
            new MySqlCommand(sql, connection);

        await using var reader =
            await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var processo = new ProcessoLicitatorio
            {
                Id = reader.GetInt32("id"),
                Numero = reader.GetString("numero"),
                Objeto = reader.GetString("objeto"),
                Modalidade = reader.GetString("modalidade"),
                Secretaria = reader.GetString("secretaria"),
                DataAbertura = reader.GetDateTime("data_abertura"),
                Situacao = reader.GetString("situacao"),
                DataCadastro = reader.GetDateTime("data_cadastro")
            };

            processos.Add(processo);
        }

        return processos;
    }

    public async Task<ProcessoLicitatorio> InserirAsync(ProcessoLicitatorio processo)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        const string sql = @"
            INSERT INTO processos_licitatorios
                (numero, objeto, modalidade, secretaria, data_abertura, situacao, data_cadastro)
            VALUES
                (@Numero, @Objeto, @Modalidade, @Secretaria, @DataAbertura, @Situacao, @DataCadastro);
            SELECT LAST_INSERT_ID();";

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Numero",       processo.Numero);
        command.Parameters.AddWithValue("@Objeto",       processo.Objeto);
        command.Parameters.AddWithValue("@Modalidade",   processo.Modalidade);
        command.Parameters.AddWithValue("@Secretaria",   processo.Secretaria);
        command.Parameters.AddWithValue("@DataAbertura", processo.DataAbertura);
        command.Parameters.AddWithValue("@Situacao",     processo.Situacao);
        command.Parameters.AddWithValue("@DataCadastro", processo.DataCadastro);

        var id = Convert.ToInt32(await command.ExecuteScalarAsync());
        processo.Id = id;

        return processo;
    }
}
