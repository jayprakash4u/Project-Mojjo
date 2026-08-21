namespace Mojjo.Application.DTOs.Common;

public class PaginationParams
{
    private const int MaxPageSize = 50;
    private int _pageSize = 20;

    public int Page { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, MaxPageSize);
    }
}
