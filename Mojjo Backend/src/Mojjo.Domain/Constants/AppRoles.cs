namespace Mojjo.Domain.Constants;

public static class AppRoles
{
    public const string Customer = "Customer";
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string DeliveryAgent = "DeliveryAgent";
    public const string Seller = "Seller";

    public static readonly IReadOnlyList<string> All = new[]
    {
        Customer,
        Admin,
        Manager,
        DeliveryAgent,
        Seller
    };
}
