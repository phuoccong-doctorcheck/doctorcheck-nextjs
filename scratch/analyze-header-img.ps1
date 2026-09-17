Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("D:\LandingPages\doctorcheck-nextjs\doctorcheck-source\screenshots\desktop\desktop-homepage-01-header.png")
$w = $bmp.Width
$h = $bmp.Height

# Find non-white column spans
$activeCols = @()
for ($x = 0; $x -lt $w; $x++) {
    $hasContent = $false
    for ($y = 10; $y -lt ($h - 10); $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if not near-white
        if ($pixel.R -lt 240 -or $pixel.G -lt 240 -or $pixel.B -lt 240) {
            $hasContent = $true
            break
        }
    }
    if ($hasContent) {
        $activeCols += $x
    }
}

# Group into continuous clusters
$clusters = @()
$currStart = $null
$prev = $null
foreach ($col in $activeCols) {
    if ($null -eq $currStart) {
        $currStart = $col
        $prev = $col
    } elseif ($col - $prev -gt 8) {
        $clusters += [PSCustomObject]@{ Start = $currStart; End = $prev; Width = ($prev - $currStart + 1) }
        $currStart = $col
        $prev = $col
    } else {
        $prev = $col
    }
}
if ($null -ne $currStart) {
    $clusters += [PSCustomObject]@{ Start = $currStart; End = $prev; Width = ($prev - $currStart + 1) }
}

$bmp.Dispose()
$clusters | Format-Table -AutoSize
