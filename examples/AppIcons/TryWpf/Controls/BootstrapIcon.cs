using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using SharedLib.Bootstrap;

namespace TryWpf.Controls;

public class BootstrapIcon : Control
{
    private static readonly Dictionary<BootstrapSymbol, SymbolParsed> _symbolParsedDict = [];

    static BootstrapIcon()
    {
        DefaultStyleKeyProperty.OverrideMetadata(typeof(BootstrapIcon), new FrameworkPropertyMetadata(typeof(BootstrapIcon)));
    }

    private static void OnBootstrapSymbolChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is BootstrapIcon icon && e.NewValue is BootstrapSymbol symb)
        {
            if (_symbolParsedDict.TryGetValue(symb, out var pathData))
            {
                ApplySymbolData(icon, pathData);
            }
            else
            {
                pathData = ConvertToSymbolParsed(symb);
                _symbolParsedDict.Add(symb, pathData);
                ApplySymbolData(icon, pathData);
            }
        }
    }

    static SymbolParsed ConvertToSymbolParsed(BootstrapSymbol symb)
    {
        try
        {
            var (primaryPath, primaryArgb, secondaryPath, secondaryArgb) = symb.GetDualPathDefinition();

            Geometry? primaryGeo = Geometry.Parse(primaryPath ?? "");
            Brush? primaryBrush = GetBrushFromArgb(primaryArgb);
            Geometry? secondaryGeo = Geometry.Parse(secondaryPath ?? ""); ;
            Brush? secondaryBrush = GetBrushFromArgb(secondaryArgb);

            return new SymbolParsed(primaryGeo, primaryBrush, secondaryGeo, secondaryBrush);
        }
        catch
        {
            return SymbolParsed.Empty;
        }
    }

    private static void ApplySymbolData(BootstrapIcon icon, SymbolParsed data)
    {
        icon.PrimaryGeometry = data.PrimaryGeometry;
        icon.SecondaryGeometry = data.SecondaryGeometry;

        if (data.PrimaryForeground != null)
        {
            icon.PrimaryForeground = data.PrimaryForeground;
        }
        else
        {
            icon.ClearValue(PrimaryForegroundProperty);
        }

        if (data.SecondaryForeground != null)
        {
            icon.SecondaryForeground = data.SecondaryForeground;
        }
        else
        {
            icon.ClearValue(SecondaryForegroundProperty);
        }
    }

    #region // Properties
    public static readonly DependencyProperty SymbolProperty
        = DependencyProperty.Register(nameof(Symbol), typeof(BootstrapSymbol), typeof(BootstrapIcon),
            new PropertyMetadata(default(BootstrapSymbol), OnBootstrapSymbolChanged));
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

    private static Brush? GetBrushFromArgb(uint ardb)
    {
        if (ardb == 0)
            return null;

        var sysColor = System.Drawing.Color.FromArgb(unchecked((int)ardb));
        var brush = new SolidColorBrush(Color.FromArgb(sysColor.A, sysColor.R, sysColor.G, sysColor.B));

        // заморозить кисть, если она не будет изменяться
        if (brush.CanFreeze)
            brush.Freeze();

        return brush;
    }

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

        public static SymbolParsed Empty => new SymbolParsed(null, null, null, null);
    }
}
