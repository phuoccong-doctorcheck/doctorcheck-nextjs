Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("D:\LandingPages\doctorcheck-nextjs\doctorcheck-source\screenshots\desktop\desktop-homepage-01-header.png")

# Line 1 (Y=20 to 38) vs Line 2 (Y=44 to 63) in Item 5
$line1End = 0
$line2End = 0
for ($x = 1197; $x -le 1382; $x++) {
    for ($y = 20; $y -le 38; $y++) {
        $p = $bmp.GetPixel($x, $y)
        # exclude red badge
        if ($p.R -lt 150 -and $p.G -lt 150 -and $p.B -lt 150) {
            if ($x -gt $line1End) { $line1End = $x }
        }
    }
    for ($y = 44; $y -le 63; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 150 -and $p.G -lt 150 -and $p.B -lt 150) {
            if ($x -gt $line2End) { $line2End = $x }
        }
    }
}
Write-Output "Item 5: Line 1 text ends at X = $line1End"
Write-Output "Item 5: Line 2 text (and chevron) ends at X = $line2End"

# Let's also check Item 1, 2, 3, 4 line 1 vs line 2 ends and chevrons
$items = @(
    @{ Name = "Item 1 (Ve Doctor Check)"; Start = 585; End = 707 },
    @{ Name = "Item 2 (Tam Soat Nu)"; Start = 733; End = 870 },
    @{ Name = "Item 3 (Tam Soat Nam)"; Start = 896; End = 1032 },
    @{ Name = "Item 4 (6 Thoi Quen)"; Start = 1059; End = 1169 }
)

foreach ($it in $items) {
    $l1Start = 9999; $l1End = 0; $l2Start = 9999; $l2End = 0
    for ($x = $it.Start; $x -le $it.End; $x++) {
        for ($y = 20; $y -le 38; $y++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.R -lt 150 -and $p.G -lt 150 -and $p.B -lt 150) {
                if ($x -lt $l1Start) { $l1Start = $x }
                if ($x -gt $l1End) { $l1End = $x }
            }
        }
        for ($y = 44; $y -le 63; $y++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.R -lt 150 -and $p.G -lt 150 -and $p.B -lt 150) {
                if ($x -lt $l2Start) { $l2Start = $x }
                if ($x -gt $l2End) { $l2End = $x }
            }
        }
    }
    Write-Output "$($it.Name): Line 1 ($l1Start to $l1End, w=$($l1End-$l1Start+1)), Line 2 ($l2Start to $l2End, w=$($l2End-$l2Start+1))"
}

$bmp.Dispose()
