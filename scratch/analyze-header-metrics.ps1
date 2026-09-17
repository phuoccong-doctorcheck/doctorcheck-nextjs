Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("D:\LandingPages\doctorcheck-nextjs\doctorcheck-source\screenshots\desktop\desktop-homepage-01-header.png")

$minY = 999
$maxY = -1
$colors = @{}

for ($x = 585; $x -le 707; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 100 -and $p.G -lt 100 -and $p.B -lt 100) {
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $p.R, $p.G, $p.B
            if ($colors.ContainsKey($hex)) {
                $colors[$hex] = $colors[$hex] + 1
            } else {
                $colors[$hex] = 1
            }
        }
    }
}

Write-Output "Text vertical range: Y = $minY to $maxY (Height: $($maxY - $minY + 1))"
$sorted = $colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 5
Write-Output "Top darkest text colors:"
$sorted | Format-Table -AutoSize

# Check VIP badge pixels in Item 5 (1197 to 1382)
$vipMinX = 9999; $vipMaxX = -1; $vipMinY = 9999; $vipMaxY = -1
for ($x = 1197; $x -le 1382; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 180 -and $p.G -lt 50 -and $p.B -lt 50) { # Red
            if ($x -lt $vipMinX) { $vipMinX = $x }
            if ($x -gt $vipMaxX) { $vipMaxX = $x }
            if ($y -lt $vipMinY) { $vipMinY = $y }
            if ($y -gt $vipMaxY) { $vipMaxY = $y }
        }
    }
}
Write-Output "VIP Badge Box: X = $vipMinX to $vipMaxX (Width: $($vipMaxX - $vipMinX + 1)), Y = $vipMinY to $vipMaxY (Height: $($vipMaxY - $vipMinY + 1))"
$bmp.Dispose()
