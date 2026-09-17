Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("D:\LandingPages\doctorcheck-nextjs\doctorcheck-source\screenshots\desktop\desktop-homepage-01-header.png")

# Let's inspect stroke width of letter 'T' in "Tầm Soát Bệnh" (X around 734-750)
$tCols = @()
for ($x = 734; $x -le 746; $x++) {
    $darkCount = 0
    for ($y = 20; $y -le 38; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 120 -and $p.G -lt 120 -and $p.B -lt 120) {
            $darkCount++
        }
    }
    if ($darkCount -gt 5) {
        $tCols += $x
    }
}
Write-Output "Vertical stem width of T: $($tCols.Count) pixels"

# Check height of letter 'T'
$minY = 999; $maxY = -1
foreach ($x in $tCols) {
    for ($y = 20; $y -le 38; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 120 -and $p.G -lt 120 -and $p.B -lt 120) {
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Output "Cap-height of T: $($maxY - $minY + 1) pixels (Y: $minY to $maxY)"

# Check logo dimensions
$logoMinX = 999; $logoMaxX = -1; $logoMinY = 999; $logoMaxY = -1
for ($x = 300; $x -le 450; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
            if ($x -lt $logoMinX) { $logoMinX = $x }
            if ($x -gt $logoMaxX) { $logoMaxX = $x }
            if ($y -lt $logoMinY) { $logoMinY = $y }
            if ($y -gt $logoMaxY) { $logoMaxY = $y }
        }
    }
}
Write-Output "Logo Box in 1904px screenshot: X = $logoMinX to $logoMaxX (Width: $($logoMaxX - $logoMinX + 1)), Y = $logoMinY to $logoMaxY (Height: $($logoMaxY - $logoMinY + 1))"

$bmp.Dispose()
