
using Licitatrack.Api.Repositories;
using Licitatrack.Api.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();


builder.Services.AddOpenApi();


builder.Services.AddScoped<ProcessoRepository>();
builder.Services.AddScoped<ProcessoService>();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


app.UseHttpsRedirection();

app.UseAuthorization();


app.MapControllers();

app.Run();
