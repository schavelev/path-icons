using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;
using SharedLib.Bootstrap;
using System.Collections.Generic;

namespace TryAvalonia;

/// <summary>
/// A custom Avalonia control for rendering Bootstrap icons with primary and secondary geometries and colors.
/// </summary>
public class BootstrapIcon : IconElement // PathIcon
{
    // A cache to store parsed symbol data for each BootstrapSymbol to improve performance.
    private static readonly Dictionary<BootstrapSymbol, SymbolParsed> _symbolDataCache = [];

    // Static constructor to set up property change handling for the Symbol property.
    static BootstrapIcon()
    {
        SymbolProperty.Changed.AddClassHandler<BootstrapIcon>((x, e) => x.OnSymbolChanged(e));
    }

    // Handles changes to the Symbol property, updating the control's geometries and colors.
    private void OnSymbolChanged(AvaloniaPropertyChangedEventArgs e)
    {
        var symb = e.GetNewValue<BootstrapSymbol>();
        if (_symbolDataCache.TryGetValue(symb, out var pathData))
        {
            // Use cached data if available.
            ApplySymbolData(pathData);
        }
        else
        {
            // Parse and cache new symbol data, then apply it.
            pathData = ConvertToSymbolParsed(symb);
            _symbolDataCache.Add(symb, pathData);
            ApplySymbolData(pathData);
        }
    }

    // Converts a BootstrapSymbol into parsed geometry and brush data for rendering.
    static SymbolParsed ConvertToSymbolParsed(BootstrapSymbol symb)
    {
        try
        {
            var (primaryPath, primaryArgb, secondaryPath, secondaryArgb) = symb.GetDualPathDefinition();
            Geometry? primaryGeo = Geometry.Parse(primaryPath ?? "");
            IBrush? primaryBrush = GetBrushFromArgb(primaryArgb);
            Geometry? secondaryGeo = Geometry.Parse(secondaryPath ?? "");
            IBrush? secondaryBrush = GetBrushFromArgb(secondaryArgb);

            // Return parsed data as a SymbolParsed struct.
            return new SymbolParsed(primaryGeo, primaryBrush, secondaryGeo, secondaryBrush);
        }
        catch
        {
            // Return empty data if parsing fails.
            return SymbolParsed.Empty;
        }
    }

    // Applies parsed symbol data to the control's properties.
    private void ApplySymbolData(SymbolParsed data)
    {
        // Set primary and secondary geometries.
        PrimaryGeometry = data.PrimaryGeometry;
        SecondaryGeometry = data.SecondaryGeometry;

        // Set primary foreground brush if available, otherwise clear the property.
        if (data.PrimaryForeground != null)
        {
            PrimaryForeground = data.PrimaryForeground;
        }
        else
        {
            ClearValue(PrimaryForegroundProperty);
        }

        // Set secondary foreground brush if available, otherwise clear the property.
        if (data.SecondaryForeground != null)
        {
            SecondaryForeground = data.SecondaryForeground;
        }
        else
        {
            ClearValue(SecondaryForegroundProperty);
        }
    }

    #region // Properties
    public static readonly StyledProperty<BootstrapSymbol> SymbolProperty =
        AvaloniaProperty.Register<BootstrapIcon, BootstrapSymbol>(nameof(Symbol), BootstrapSymbol.None);
    public BootstrapSymbol Symbol
    {
        get => GetValue(SymbolProperty);
        set => SetValue(SymbolProperty, value);
    }

    public static readonly StyledProperty<Geometry?> PrimaryGeometryProperty =
        AvaloniaProperty.Register<BootstrapIcon, Geometry?>(nameof(PrimaryGeometry));
    public Geometry? PrimaryGeometry
    {
        get => GetValue(PrimaryGeometryProperty);
        set => SetValue(PrimaryGeometryProperty, value);
    }

    public static readonly StyledProperty<IBrush?> PrimaryForegroundProperty =
        AvaloniaProperty.Register<BootstrapIcon, IBrush?>(nameof(PrimaryForeground));
    public IBrush? PrimaryForeground
    {
        get => GetValue(PrimaryForegroundProperty);
        set => SetValue(PrimaryForegroundProperty, value);
    }

    public static readonly StyledProperty<Geometry?> SecondaryGeometryProperty =
        AvaloniaProperty.Register<BootstrapIcon, Geometry?>(nameof(SecondaryGeometry));
    public Geometry? SecondaryGeometry
    {
        get => GetValue(SecondaryGeometryProperty);
        set => SetValue(SecondaryGeometryProperty, value);
    }

    public static readonly StyledProperty<IBrush?> SecondaryForegroundProperty =
        AvaloniaProperty.Register<BootstrapIcon, IBrush?>(nameof(SecondaryForeground));
    public IBrush? SecondaryForeground
    {
        get => GetValue(SecondaryForegroundProperty);
        set => SetValue(SecondaryForegroundProperty, value);
    }
    #endregion

    // Converts an ARGB uint value into a SolidColorBrush, or null if the value is 0.
    private static IBrush? GetBrushFromArgb(uint ardb)
        => ardb == 0 ? null : new SolidColorBrush(ardb);

    // A struct to hold parsed geometry and brush data for a symbol.
    private readonly struct SymbolParsed
    {
        public Geometry? PrimaryGeometry { get; }
        public IBrush? PrimaryForeground { get; }
        public Geometry? SecondaryGeometry { get; }
        public IBrush? SecondaryForeground { get; }

        public SymbolParsed(Geometry? primaryGeo, IBrush? primaryBrush, Geometry? secondaryGeo, IBrush? secondaryBrush)
        {
            PrimaryGeometry = primaryGeo;
            PrimaryForeground = primaryBrush;
            SecondaryGeometry = secondaryGeo;
            SecondaryForeground = secondaryBrush;
        }

        // An empty SymbolParsed instance for error cases.
        public static SymbolParsed Empty => new(null, null, null, null);
    }
}