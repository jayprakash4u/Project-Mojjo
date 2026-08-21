namespace Mojjo.Application.DTOs.Users;

public class UserAddressDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = "Home";
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Landmark { get; set; }
    public bool IsDefault { get; set; }
}
