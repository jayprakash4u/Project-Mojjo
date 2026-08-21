using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Mojjo.Api.Extensions;
using Mojjo.Api.Middleware;
using Mojjo.Application;
using Mojjo.Domain.Entities;
using Mojjo.Infrastructure;
using Mojjo.Infrastructure.Persistence;
using Mojjo.Infrastructure.Seeding;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Bootstrap Enterprise Structured Logging (Serilog)
builder.ConfigureSerilog();

// 2. Request Size Limits (5MB global payload limit for DoS defense)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 5 * 1024 * 1024; // 5MB
});
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 5 * 1024 * 1024;
});

// 3. Clean Architecture Layer Registrations
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 4. Security, Versioning, CORS, RateLimiter, HealthChecks, and Documentation
builder.Services.AddApiVersioningConfiguration();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddCustomRateLimiting();
builder.Services.AddCustomHealthChecks(builder.Configuration);
builder.Services.AddSwaggerDocumentation();

// 5. Controllers & JSON Serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

// 6. Security Secrets & Configuration Integrity Validation
app.ValidateProductionSecrets();

// 7. Automatic Database Schema & Seed Data Initialization (Non-blocking background startup)
_ = Task.Run(async () =>
{
    try
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MojjoDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Automatically apply any pending EF Core migrations on startup
        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            await dbContext.Database.MigrateAsync();
        }
        await DatabaseSeeder.SeedAsync(dbContext, roleManager, userManager);
        Log.Information("Mojjo Database, EF Core Migrations, Roles, and Admin seeded successfully on SQL Server Express.");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Could not initialize/seed SQL Server database. Verify connection string in appsettings.json.");
    }
});

// 7. Security & Structured Observability Pipeline
app.UseMiddleware<RequestLogEnrichmentMiddleware>();

// Serilog HTTP Request Logging (High-precision timing & masked diagnostics)
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
app.UseSecurityHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mojjo API v1");
        c.RoutePrefix = string.Empty;
    });
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// 8. CDN Static Assets & Object Storage with 1-Year Immutable Caching
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Cache-Control", "public, max-age=31536000, immutable");
    }
});

app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapCustomHealthChecks();
app.MapHub<Mojjo.Infrastructure.Hubs.OrderTrackingHub>("/hubs/order-tracking");

try
{
    Log.Information("Starting Mojjo API host...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Mojjo API host terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}
