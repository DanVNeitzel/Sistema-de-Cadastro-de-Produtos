using System.ComponentModel.DataAnnotations;

namespace ProductManagement.API.Models
{
    /// <summary>
    /// Entidade que representa um produto no sistema
    /// Configurada para Entity Framework Core
    /// </summary>
    public class Product
    {
        /// <summary>
        /// Identificador único do produto
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Nome do produto - obrigatório, até 100 caracteres
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Descrição detalhada do produto - opcional, até 500 caracteres
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Preço do produto em decimal com 2 casas decimais
        /// </summary>
        [Required]
        [Range(0.01, 999999.99)]
        public decimal Price { get; set; }

        /// <summary>
        /// Categoria do produto - obrigatório, até 50 caracteres
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// URL da imagem do produto - opcional, até 500 caracteres
        /// </summary>
        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Indica se o produto está ativo/disponível
        /// </summary>
        public bool Active { get; set; } = true;

        /// <summary>
        /// Data de criação do registro
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Data da última atualização do registro
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Enum para categorias de produtos
    /// Facilita validação e padronização
    /// </summary>
    public enum ProductCategory
    {
        ELETRONICOS,
        ROUPAS,
        CASA,
        ESPORTES,
        LIVROS,
        OUTROS
    }
}