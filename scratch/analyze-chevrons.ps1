Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("D:\LandingPages\doctorcheck-nextjs\doctorcheck-source\screenshots\desktop\desktop-homepage-01-header.png")

# For Item 1, chevron is between X = 694 and 707
$chevMinY = 999; $chevMaxY = -1
for ($x = 694; $x -le 707; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 150 -and $p.G -lt 150 -and $p.B -lt 150) {
            if ($y -lt $chevMinY) { $chevMinY = $y }
            if ($y -gt $chevMaxY) { $chevMaxY = $y }
        }
    }
}
Write-Output "Item 1 chevron Y range: $chevMinY to $chevMaxY"

# For Item 2, chevron:
# Line 1 is 734 to 855. Item 2 ends at 870! So chevron is at X = 856 to 870!
$chev2MinY = 999; $chev2MaxY = -1
for ($x = 856; $x -le 870; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 150 -and $p.G -lt 150 -and $p.B -lt 150) {
            if ($y -lt $chev2MinY) { $chev2MinY = $y }
            if ($y -gt $chev2MaxY) { $chev2MaxY = $y }
        }
    }
}
Write-Output "Item 2 chevron Y range: $chev2MinY to $chev2MaxY"

$bmp.Dispose()
