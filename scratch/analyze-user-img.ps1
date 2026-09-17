Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\phuoccong.nguyen\.gemini\antigravity-ide\brain\5e9aeaeb-bbad-4246-9969-d4c8af7543c3\.user_uploaded\media_1789547097830.png")
$w = $bmp.Width
$h = $bmp.Height

$activeCols = @()
for ($x = 0; $x -lt $w; $x++) {
    $hasContent = $false
    for ($y = 2; $y -lt ($h - 2); $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.R -lt 230 -or $pixel.G -lt 230 -or $pixel.B -lt 230) {
            $hasContent = $true
            break
        }
    }
    if ($hasContent) {
        $activeCols += $x
    }
}

$clusters = @()
$currStart = $null
$prev = $null
foreach ($col in $activeCols) {
    if ($null -eq $currStart) {
        $currStart = $col
        $prev = $col
    } elseif ($col - $prev -gt 6) {
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
