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

    public async Task<List<ProcessoLicitatorio>> Listar()
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

    public async Task<ProcessoLicitatorio?> BuscarPorId(int id)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        const string sql = @"
            SELECT
                id, numero, objeto, modalidade,
                secretaria, data_abertura, situacao,
                data_cadastro
            FROM processos_licitatorios
            WHERE id = @Id;
        ";

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Id", id);

        await using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new ProcessoLicitatorio
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
        }

        return null;
    }

    public async Task<ProcessoLicitatorio> Inserir(ProcessoLicitatorio processo)
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

    public async Task<bool> AtualizarSituacao(int id, string? situacaoAnterior, string novaSituacao, string? observacao = null)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            const string sqlUpdate = @"
                UPDATE processos_licitatorios
                SET situacao = @Situacao
                WHERE id = @Id;
            ";

            await using var updateCommand = new MySqlCommand(sqlUpdate, connection, transaction);
            updateCommand.Parameters.AddWithValue("@Situacao", novaSituacao);
            updateCommand.Parameters.AddWithValue("@Id", id);

            var rowsAffected = await updateCommand.ExecuteNonQueryAsync();

            if (situacaoAnterior != novaSituacao)
            {
                const string sqlInsertHistorico = @"
                    INSERT INTO historico_processos
                        (processo_id, situacao_anterior, situacao_nova, observacao, data_alteracao)
                    VALUES
                        (@ProcessoId, @SituacaoAnterior, @SituacaoNova, @Observacao, @DataAlteracao);
                ";

                await using var historyCommand = new MySqlCommand(sqlInsertHistorico, connection, transaction);
                historyCommand.Parameters.AddWithValue("@ProcessoId", id);
                historyCommand.Parameters.AddWithValue("@SituacaoAnterior", (object?)situacaoAnterior ?? DBNull.Value);
                historyCommand.Parameters.AddWithValue("@SituacaoNova", novaSituacao);
                historyCommand.Parameters.AddWithValue("@Observacao", (object?)observacao ?? DBNull.Value);
                historyCommand.Parameters.AddWithValue("@DataAlteracao", DateTime.UtcNow);

                await historyCommand.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();
            return rowsAffected > 0;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<HistoricoProcesso>> ListarHistorico(int processoId)
    {
        var historico = new List<HistoricoProcesso>();

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        const string sql = @"
            SELECT
                id, processo_id, situacao_anterior, situacao_nova,
                observacao, data_alteracao
            FROM historico_processos
            WHERE processo_id = @ProcessoId
            ORDER BY data_alteracao DESC, id DESC;
        ";

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ProcessoId", processoId);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var item = new HistoricoProcesso
            {
                Id = reader.GetInt32("id"),
                ProcessoId = reader.GetInt32("processo_id"),
                SituacaoAnterior = reader.IsDBNull(reader.GetOrdinal("situacao_anterior")) ? null : reader.GetString("situacao_anterior"),
                SituacaoNova = reader.GetString("situacao_nova"),
                Observacao = reader.IsDBNull(reader.GetOrdinal("observacao")) ? null : reader.GetString("observacao"),
                DataAlteracao = DateTime.SpecifyKind(reader.GetDateTime("data_alteracao"), DateTimeKind.Utc)
            };

            historico.Add(item);
        }

        return historico;
    }
}
