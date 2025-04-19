using Avalonia.Markup.Xaml;
using Avalonia.Media;
using SharedLib.Bootstrap;
using System.Collections.Concurrent;
using System;

namespace TryAvalonia.MarkupExtensions;

// A markup extension for converting BootstrapSymbol values into Avalonia Geometry objects in XAML.
public class BootstrapGeometryExtension : MarkupExtension
{
    // A thread-safe cache to store parsed Geometry objects for each BootstrapSymbol to improve performance.
    private static readonly ConcurrentDictionary<BootstrapSymbol, Geometry> _geometryCache = new();

    // The BootstrapSymbol to convert into a Geometry.
    public BootstrapSymbol Symbol { get; set; }

    // Default constructor for XAML usage where Symbol is set via property.
    public BootstrapGeometryExtension() { }

    // Constructor that initializes the extension with a specific BootstrapSymbol.
    public BootstrapGeometryExtension(BootstrapSymbol symbol)
    {
        Symbol = symbol;
    }

    // Provides the Geometry object for the specified BootstrapSymbol, used in XAML binding.
    public override object ProvideValue(IServiceProvider serviceProvider)
        => _geometryCache.GetOrAdd(Symbol, _ => Geometry.Parse(Symbol.GetGeometryPath() ?? "")); // Parse the symbol's path data into a Geometry, caching the result.
}