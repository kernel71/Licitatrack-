
using Licitatrack.Api.Repositories;
using Licitatrack.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string AngularClientOrigin = "AngularClient";
builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularClientOrigin, policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();


builder.Services.AddOpenApi();


builder.Services.AddScoped<ProcessoRepository>();
builder.Services.AddScoped<ProcessoService>();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(AngularClientOrigin);

app.UseHttpsRedirection();

app.UseAuthorization();


app.MapControllers();

app.Run();
