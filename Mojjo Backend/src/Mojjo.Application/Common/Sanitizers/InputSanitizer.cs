using System.Text.RegularExpressions;

namespace Mojjo.Application.Common.Sanitizers;

public static class InputSanitizer
{
    private static readonly Regex HtmlTagRegex = new(@"<[^>]*?>", RegexOptions.Compiled);
    private static readonly Regex ScriptTagRegex = new(@"<script[\s\S]*?>[\s\S]*?<\/script>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex DangerousCharsRegex = new(@"[^\w\s\.\,\@\-\+\#\:\/\(\)]", RegexOptions.Compiled);

    /// <summary>
    /// Removes HTML tags, scripts, and trims whitespace.
    /// </summary>
    public static string SanitizeText(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var withoutScripts = ScriptTagRegex.Replace(input, string.Empty);
        var withoutHtml = HtmlTagRegex.Replace(withoutScripts, string.Empty);
        return withoutHtml.Trim();
    }

    /// <summary>
    /// Normalizes and cleans phone numbers (removes whitespace, hyphens, and non-numeric chars except +).
    /// </summary>
    public static string SanitizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        return Regex.Replace(phone.Trim(), @"[^\d\+]", string.Empty);
    }
}
