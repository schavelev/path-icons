using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using SharedLib.Bootstrap;

namespace TryWpf.Controls;

/// <summary>
/// A custom Avalonia control for rendering Bootstrap icons with primary and secondary geometries and colors.
/// </summary>
public class BootstrapIcon : Control
{
    // A cache to store parsed symbol data for each BootstrapSymbol to improve performance.
    private static readonly Dictionary<BootstrapSymbol, SymbolParsed> _symbolDataCache = [];

    // Static constructor
    static BootstrapIcon()
    {
        DefaultStyleKeyProperty.OverrideMetadata(typeof(BootstrapIcon), new FrameworkPropertyMetadata(typeof(BootstrapIcon)));
        SymbolProperty = DependencyProperty.Register(nameof(Symbol), typeof(BootstrapSymbol), typeof(BootstrapIcon),
            new FrameworkPropertyMetadata(
                BootstrapSymbol.None,
                FrameworkPropertyMetadataOptions.AffectsRender,
                OnSymbolChanged));
    }

    // Handles changes to the Symbol property, updating the control's geometries and colors.
    private static void OnSymbolChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is BootstrapIcon icon && e.NewValue is BootstrapSymbol symb)
        {
            if (!_symbolDataCache.TryGetValue(symb, out var pathData))
            {
                // Parse and cache new symbol data
                pathData = CreateSymbolParsed(symb);
                _symbolDataCache.Add(symb, pathData);
            }
            icon.ApplySymbolData(pathData);
        }
    }

    #region // Properties
    public static readonly DependencyProperty SymbolProperty;
        //= DependencyProperty.Register(nameof(Symbol), typeof(BootstrapSymbol), typeof(BootstrapIcon), new PropertyMetadata());
    public BootstrapSymbol Symbol
    {
        get => (BootstrapSymbol)GetValue(SymbolProperty);
        set => SetValue(SymbolProperty, value);
    }

    public static readonly DependencyProperty PrimaryGeometryProperty
        = DependencyProperty.Register(nameof(PrimaryGeometry), typeof(Geometry), typeof(BootstrapIcon), new PropertyMetadata());
    public Geometry? PrimaryGeometry
    {
        get => (Geometry?)GetValue(PrimaryGeometryProperty);
        private set => SetValue(PrimaryGeometryProperty, value);
    }

    public static readonly DependencyProperty PrimaryForegroundProperty
        = DependencyProperty.Register(nameof(PrimaryForeground), typeof(Brush), typeof(BootstrapIcon), new PropertyMetadata());
    public Brush? PrimaryForeground
    {
        get => (Brush?)GetValue(PrimaryForegroundProperty);
        set => SetValue(PrimaryForegroundProperty, value);
    }

    public static readonly DependencyProperty SecondaryGeometryProperty
        = DependencyProperty.Register(nameof(SecondaryGeometry), typeof(Geometry), typeof(BootstrapIcon), new PropertyMetadata());
    public Geometry? SecondaryGeometry
    {
        get => (Geometry?)GetValue(SecondaryGeometryProperty);
        private set => SetValue(SecondaryGeometryProperty, value);
    }

    public static readonly DependencyProperty SecondaryForegroundProperty
        = DependencyProperty.Register(nameof(SecondaryForeground), typeof(Brush), typeof(BootstrapIcon), new PropertyMetadata());
    public Brush? SecondaryForeground
    {
        get => (Brush?)GetValue(SecondaryForegroundProperty);
        set => SetValue(SecondaryForegroundProperty, value);
    }
    #endregion

    // Converts an ARGB uint value into a SolidColorBrush, or null if the value is 0.
    private static Brush? CreateBrushFromArgb(uint ardb)
    {
        if (ardb == 0)
            return null;

        var sysColor = System.Drawing.Color.FromArgb(unchecked((int)ardb));
        var brush = new SolidColorBrush(Color.FromArgb(sysColor.A, sysColor.R, sysColor.G, sysColor.B));

        if (brush.CanFreeze)
            brush.Freeze();

        return brush;
    }

    // Converts a BootstrapSymbol into parsed geometry and brush data for rendering.
    private static SymbolParsed CreateSymbolParsed(BootstrapSymbol symb)
    {
        try
        {
            var (primaryPath, primaryArgb, secondaryPath, secondaryArgb) = symb.GetGeometryDefinition();
            Geometry? primaryGeo = Geometry.Parse(primaryPath ?? "");
            Brush? primaryBrush = CreateBrushFromArgb(primaryArgb);
            Geometry? secondaryGeo = Geometry.Parse(secondaryPath ?? "");
            Brush? secondaryBrush = CreateBrushFromArgb(secondaryArgb);

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

    // A struct to hold parsed geometry and brush data for a symbol.
    private readonly struct SymbolParsed
    {
        public Geometry? PrimaryGeometry { get; }
        public Brush? PrimaryForeground { get; }
        public Geometry? SecondaryGeometry { get; }
        public Brush? SecondaryForeground { get; }

        public SymbolParsed(Geometry? primaryGeo, Brush? primaryBrush, Geometry? secondaryGeo, Brush? secondaryBrush)
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
