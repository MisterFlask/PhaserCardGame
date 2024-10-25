# PowerShell script to output a JSON list of .svg and .jpg files in the current directory

# Get the current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir"

# Get all .svg and .jpg files in the current directory
$files = Get-ChildItem -Path . -File -Force | Where-Object { $_.Extension -in '.svg', '.jpg' }

# Output the number of files found
Write-Host "Number of .svg and .jpg files found: $($files.Count)"

# If no files are found, output a message
if ($files.Count -eq 0) {
    Write-Host "No .svg or .jpg files found in the current directory."
    exit
}

# Create an array to hold the file names
$fileNames = @($files | Select-Object -ExpandProperty Name)

# Output the file names
Write-Host "SVG and JPG files found:"
$fileNames | ForEach-Object { Write-Host $_ }

# Convert the array to JSON
$jsonOutput = $fileNames | ConvertTo-Json

# Output the JSON
Write-Host "JSON output:"
Write-Output $jsonOutput

# Optionally, save the JSON to a file
$jsonOutput | Out-File -FilePath "file_list.json"
Write-Host "JSON output saved to file_list.json"