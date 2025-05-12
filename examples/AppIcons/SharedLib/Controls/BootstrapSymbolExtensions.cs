using System.Reflection;

namespace SharedLib.Controls;

/// <summary>
/// Provides extension methods for the BootstrapSymbol enum to extract SVG path and color information.
/// </summary>
public static partial class BootstrapSymbolExtensions
{
    // Retrieves all SVG path data for a BootstrapSymbol and joins them into a single string.
    public static string? GetGeometryPath(this BootstrapSymbol value)
    {
        var pathData = GetEnumAttributes<SymbolPathAttribute>(value)
            ?.Select(symb => symb.PathData);
        return string.Join(" ", pathData ?? []);
    }

    // Splits SVG path data into primary and secondary paths with their respective colors.
    public static (string?, uint, string?, uint) GetGeometryDefinition(this BootstrapSymbol value)
    {
        string? primaryPath = null;
        uint primaryArgb = 0;
        string? secondaryPath = null;
        uint secondaryArgb = 0;

        // Retrieve all SymbolPathAttribute instances for the symbol.
        var pathDefs = GetEnumAttributes<SymbolPathAttribute>(value)?.ToList();
        if (pathDefs != null && pathDefs.Count > 0)
        {
            // Use the first PathData and FillColor for the primary path.
            primaryPath = pathDefs[0].PathData;
            primaryArgb = (uint)pathDefs[0].FillColor.ToArgb();

            // If there are additional paths, use the second FillColor and combine remaining PathData.
            if (pathDefs.Count > 1)
            {
                secondaryArgb = (uint)pathDefs[1].FillColor.ToArgb();
                secondaryPath = string.Join(" ", pathDefs.Skip(1).Select(gdef => gdef.PathData));
            }
        }

        // Return a tuple containing primary and secondary path data and colors.
        return (primaryPath, primaryArgb, secondaryPath, secondaryArgb);
    }

    // Helper method to retrieve custom attributes of type TAttr for an enum value.
    private static IEnumerable<TAttr>? GetEnumAttributes<TAttr>(object value) where TAttr : Attribute
        => value.GetType()
                ?.GetRuntimeField(value.ToString() ?? "")
                ?.GetCustomAttributes<TAttr>(false);
}