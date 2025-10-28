using Microsoft.EntityFrameworkCore;
using ProductManagement.API.Models;

namespace ProductManagement.API.Data
{
    /// <summary>
    /// Contexto do Entity Framework Core para gerenciamento do banco de dados
    /// Configurado para usar InMemory Database por padrão
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// DbSet para gerenciamento da entidade Product
        /// </summary>
        public DbSet<Product> Products { get; set; }

        /// <summary>
        /// Configuração do modelo de dados
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração da entidade Product
            modelBuilder.Entity<Product>(entity =>
            {
                // Configuração da chave primária
                entity.HasKey(p => p.Id);

                // Configuração das propriedades
                entity.Property(p => p.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(p => p.Description)
                    .HasMaxLength(500);

                entity.Property(p => p.Price)
                    .IsRequired()
                    .HasColumnType("decimal(18,2)");

                entity.Property(p => p.Category)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.ImageUrl)
                    .HasMaxLength(500);

                entity.Property(p => p.Active)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.Property(p => p.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()"); // Para SQL Server
                    // .HasDefaultValueSql("datetime('now')"); // Para SQLite

                entity.Property(p => p.UpdatedAt)
                    .IsRequired();

                // Índices para otimização de consultas
                entity.HasIndex(p => p.Category)
                    .HasDatabaseName("IX_Products_Category");

                entity.HasIndex(p => p.Active)
                    .HasDatabaseName("IX_Products_Active");

                entity.HasIndex(p => p.Name)
                    .HasDatabaseName("IX_Products_Name");
            });

            // Seed data - dados iniciais para desenvolvimento
            SeedData(modelBuilder);
        }

        /// <summary>
        /// Dados iniciais para desenvolvimento e testes
        /// </summary>
        private static void SeedData(ModelBuilder modelBuilder)
        {
            var products = new List<Product>
            {
                new Product
                {
                    Id = 1,
                    Name = "iPhone 15 Pro",
                    Description = "Smartphone Apple iPhone 15 Pro com chip A17 Pro, câmera profissional e tela Super Retina XDR de 6.1 polegadas.",
                    Price = 8999.99M,
                    Category = "ELETRONICOS",
                    ImageUrl = "https://example.com/iphone15pro.jpg",
                    Active = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Product
                {
                    Id = 2,
                    Name = "Notebook Dell Inspiron",
                    Description = "Notebook Dell Inspiron 15 3000 com processador Intel Core i5, 8GB RAM, SSD 256GB e Windows 11.",
                    Price = 2499.99M,
                    Category = "ELETRONICOS",
                    ImageUrl = "https://example.com/dell-inspiron.jpg",
                    Active = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-25),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Product
                {
                    Id = 3,
                    Name = "Camiseta Polo",
                    Description = "Camiseta polo masculina 100% algodão, disponível em diversas cores e tamanhos.",
                    Price = 89.90M,
                    Category = "ROUPAS",
                    ImageUrl = "https://example.com/polo-shirt.jpg",
                    Active = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Product
                {
                    Id = 4,
                    Name = "Mesa de Jantar",
                    Description = "Mesa de jantar em madeira maciça para 6 pessoas, design moderno e elegante.",
                    Price = 1299.99M,
                    Category = "CASA",
                    ImageUrl = "https://example.com/dining-table.jpg",
                    Active = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Product
                {
                    Id = 5,
                    Name = "Tênis de Corrida Nike",
                    Description = "Tênis de corrida Nike Air Zoom com tecnologia de amortecimento e design aerodinâmico.",
                    Price = 399.99M,
                    Category = "ESPORTES",
                    ImageUrl = "https://example.com/nike-running.jpg",
                    Active = false, // Produto inativo para teste
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow
                }
            };

            modelBuilder.Entity<Product>().HasData(products);
        }

        /// <summary>
        /// Override para atualizar automaticamente o campo UpdatedAt
        /// </summary>
        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        /// <summary>
        /// Override assíncrono para atualizar automaticamente o campo UpdatedAt
        /// </summary>
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        /// <summary>
        /// Atualiza automaticamente o campo UpdatedAt nas entidades modificadas
        /// </summary>
        private void UpdateTimestamps()
        {
            var entities = ChangeTracker.Entries()
                .Where(x => x.Entity is Product && (x.State == EntityState.Added || x.State == EntityState.Modified));

            foreach (var entity in entities)
            {
                if (entity.State == EntityState.Added)
                {
                    ((Product)entity.Entity).CreatedAt = DateTime.UtcNow;
                }

                ((Product)entity.Entity).UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}