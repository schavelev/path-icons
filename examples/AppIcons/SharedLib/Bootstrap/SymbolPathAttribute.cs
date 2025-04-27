using System.Drawing;

namespace SharedLib.Bootstrap;

/// <summary>
/// Defines a custom attribute to associate SVG path data and fill color with enum fields or properties.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = true)]
internal class SymbolPathAttribute : Attribute
{
    // Gets the SVG path data for rendering the icon.
    public string PathData { get; init; }

    // Gets the fill color for the SVG path.
    public Color FillColor { get; init; }

    // Initializes the attribute with path data and no fill color (defaults to Color.Empty).
    public SymbolPathAttribute(string pathData)
    {
        PathData = pathData ?? throw new ArgumentNullException(nameof(pathData));
        FillColor = Color.Empty;
    }

    // Initializes the attribute with path data and a fill color specified as an ARGB uint value.
    public SymbolPathAttribute(string pathData, uint ardb)
    {
        PathData = pathData ?? throw new ArgumentNullException(nameof(pathData));
        FillColor = Color.FromArgb((int)ardb);
    }

    // Initializes the attribute with path data and a fill color specified as a KnownColor enum value.
    public SymbolPathAttribute(string pathData, KnownColor knownColor)
    {
        PathData = pathData ?? throw new ArgumentNullException(nameof(pathData));
        FillColor = Color.FromKnownColor(knownColor);
    }
}